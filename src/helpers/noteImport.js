const fs = require("fs");
const path = require("path");
const mammoth = require("mammoth");
const TurndownService = require("turndown");

const NOTE_IMPORT_EXTENSIONS = new Set([".md", ".markdown", ".txt", ".docx"]);
const DEFAULT_NOTE_TITLES = new Set([
  "",
  "Untitled",
  "Untitled Note",
  "New note",
  "无标题",
  "无标题笔记",
  "未命名",
  "未命名筆記",
  "無標題",
  "無題",
  "無題のノート",
  "Sans titre",
  "Note sans titre",
  "Sin título",
  "Nota sin título",
  "Unbenannt",
  "Unbenannte Notiz",
  "Ohne Titel",
  "Sem título",
  "Nota sem título",
  "Senza titolo",
  "Nota senza titolo",
  "Без названия",
  "Заметка без названия",
]);

function getFileExtension(filePath) {
  return path.extname(String(filePath || "")).toLowerCase();
}

function getImportTitleFromPath(filePath) {
  return path.basename(String(filePath || "Imported note"), path.extname(String(filePath || "")));
}

function shouldReplaceNoteTitle(title) {
  return DEFAULT_NOTE_TITLES.has(String(title || "").trim());
}

function extractMarkdownTitle(markdown, fallbackTitle) {
  const heading = String(markdown || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => /^#{1,2}\s+\S/.test(line));
  return heading ? heading.replace(/^#{1,2}\s+/, "").trim() : fallbackTitle;
}

function buildTurndownService() {
  const service = new TurndownService({
    headingStyle: "atx",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
  });

  service.addRule("noteAssetImages", {
    filter: "img",
    replacement(_content, node) {
      const src = node.getAttribute("src") || "";
      const alt = node.getAttribute("alt") || "";
      return src ? `\n\n![${alt.replace(/]/g, "\\]")}](${src})\n\n` : "";
    },
  });

  return service;
}

async function importDocxAsMarkdown(databaseManager, noteId, filePath) {
  const { createNoteImageAsset } = require("./noteAssetStorage");
  let imageCount = 0;
  const result = await mammoth.convertToHtml(
    { path: filePath },
    {
      convertImage: mammoth.images.imgElement(async (image) => {
        const buffer = await image.read();
        const asset = createNoteImageAsset(databaseManager, noteId, {
          name: image.altText || `word-image-${imageCount + 1}`,
          mimeType: image.contentType,
          data: buffer,
        });
        imageCount += 1;
        return {
          src: asset.url,
          alt: image.altText || asset.filename || "",
        };
      }),
    }
  );

  const markdown = buildTurndownService().turndown(result.value).trim();
  return {
    content: markdown,
    title: extractMarkdownTitle(markdown, getImportTitleFromPath(filePath)),
    imageCount,
    warnings: result.messages || [],
  };
}

async function readImportedNoteFile(databaseManager, noteId, filePath) {
  const ext = getFileExtension(filePath);
  if (!NOTE_IMPORT_EXTENSIONS.has(ext)) {
    throw new Error("Unsupported note import file type");
  }

  if (ext === ".docx") {
    return importDocxAsMarkdown(databaseManager, noteId, filePath);
  }

  const content = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  return {
    content,
    title: extractMarkdownTitle(content, getImportTitleFromPath(filePath)),
    imageCount: 0,
    warnings: [],
  };
}

function buildImportedNoteUpdates(note, imported) {
  const updates = {
    content: imported.content,
    enhanced_content: null,
    enhancement_prompt: null,
    enhanced_at_content_hash: null,
  };

  if (shouldReplaceNoteTitle(note?.title) && imported.title) {
    updates.title = imported.title;
  }

  return updates;
}

module.exports = {
  NOTE_IMPORT_EXTENSIONS,
  buildImportedNoteUpdates,
  readImportedNoteFile,
  shouldReplaceNoteTitle,
};
