"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Đọc tất cả các file trong thư mục models, trừ index.ts
fs_1.default.readdirSync(__dirname)
    .filter(file => file !== 'index.ts')
    .forEach(file => {
    const model = require(path_1.default.join(__dirname, file));
    // Đảm bảo rằng module exports model
    if (model) {
        console.log(`Model ${file} loaded.`);
    }
});
