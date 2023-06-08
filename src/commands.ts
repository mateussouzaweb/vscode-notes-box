'use strict';

import { basename, dirname, join } from "path";
import { mkdirSync, writeFileSync, unlinkSync, lstatSync, rmdirSync, existsSync, readdirSync, renameSync } from "fs";
import { TextDocument, TextEditor, window } from "vscode";
import { getRootPath } from "./lib";

export class NotesExplorerCommands {

    /**
     * Retrieve root explorer path
     * @returns
     */
    getRoot(): string {
        return getRootPath();
    }

    /**
     * Open file
     * @param resource
     */
    openFile(resource: TextDocument): Thenable<TextEditor> {
        return window.showTextDocument(resource);
    }

    /**
     * Add file
     * @param path
     */
    async addFile(path: string): Promise<boolean> {

        const value = await window.showInputBox({
            placeHolder: "File Name.md",
            value: "File.md"
        });

        if (!value) {
            return false;
        }

        const root = (path) ? path : this.getRoot();
        const finalPath = join(root, value);

        if (!existsSync(root)) {
            mkdirSync(root, {
                mode: 0o777,
                recursive: true
            });
        }

        if (!existsSync(finalPath)) {
            writeFileSync(finalPath, new Uint8Array());
            return true;
        }

        return false;
    }

    /**
     * Add folder
     * @param path
     */
    async addFolder(path: string): Promise<boolean> {

        const value = await window.showInputBox({
            placeHolder: "Folder name",
            value: "Folder"
        });

        if (!value) {
            return false;
        }

        const root = (path) ? path : this.getRoot();
        const finalPath = join(root, value);

        if (!existsSync(finalPath)) {
            mkdirSync(finalPath, {
                mode: 0o777,
                recursive: true
            });
            return true;
        }

        return false;
    }

    /**
     * Rename file
     * @param path
     */
    async renameFile(path: string): Promise<boolean> {

        const file = basename(path);
        const directory = dirname(path);
        const value = await window.showInputBox({
            placeHolder: "File Name.md",
            value: file
        });

        if (!value) {
            return false;
        }

        const newPath = join(directory, value);
        if (!existsSync(newPath)) {
            renameSync(path, newPath);
            return true;
        }

        return false;
    }

    /**
     * Rename folder
     * @param path
     */
    async renameFolder(path: string): Promise<boolean> {

        const folder = basename(path);
        const directory = dirname(path);
        const value = await window.showInputBox({
            placeHolder: "Folder name",
            value: folder
        });

        if (!value) {
            return false;
        }

        const newPath = join(directory, value);
        if (!existsSync(newPath)) {
            renameSync(path, newPath);
            return true;
        }

        return false;
    }

    /**
     * Delete file
     * @param path
     */
    async deleteFile(path: string): Promise<boolean> {

        const file = basename(path);
        const confirm = await window.showInformationMessage(
            `Are you sure you want to delete "${file}"?`,
            { modal: true },
            "Delete file"
        );

        if (!confirm) {
            return false;
        }

        if (existsSync(path)) {
            try {
                unlinkSync(path);
                return true;
            } catch (err) {
                return false;
            }
        }

        return false;
    }

    /**
     * Delete folder
     * @param path
     */
    async deleteFolder(path: string): Promise<boolean> {

        const folder = basename(path);
        const confirm = await window.showInformationMessage(
            `Are you sure you want to delete the folder "${folder}"?`,
            { modal: true },
            "Delete folder"
        );

        if (!confirm) {
            return false;
        }

        const deleteFolder = this.deleteFolder;
        if (existsSync(path)) {

            try {

                readdirSync(path).forEach(function (entry) {
                    const entryPath = join(path, entry);
                    if (lstatSync(entryPath).isDirectory()) {
                        deleteFolder(entryPath);
                    } else {
                        unlinkSync(entryPath);
                    }
                });

                rmdirSync(path);
                return true;

            } catch (err) {
                return false;
            }

        }

        return false;
    }

}