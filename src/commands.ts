'use strict';

import { readdirSync } from "fs";
import { join } from "path";
import { mkdirSync, writeFileSync, unlinkSync, lstatSync, rmdirSync, existsSync } from "fs";
import { TextDocument, TextEditor, window, workspace } from "vscode";

export class NotesExplorerCommands {

    /**
     * Retrieve root explorer path
     * @returns
     */
    getRoot(): string {
        return workspace.getConfiguration().get('notesbox.location') as string;
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

        const self = this;
        const value = await window.showInputBox({
            placeHolder: "File Name.md",
            value: "File.md"
        });

        if( !value ){
            return false
        }

        const root = ( path ) ? path : self.getRoot();
        const finalPath = join(root, value);

        if( !existsSync(finalPath) ){
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

        const self = this;
        const value = await window.showInputBox({
            placeHolder: "Folder name",
            value: "Folder"
        });

        if( !value ){
            return false;
        }

        const root = ( path ) ? path : self.getRoot();
        const finalPath = join(root, value);

        if( !existsSync(finalPath) ){
            mkdirSync(finalPath, {
                mode: 0o777,
                recursive: true
            });
            return true;
        }

        return false;
    }

    /**
     * Delete file
     * @param path
     */
     deleteFile(path: string): boolean {

        if( existsSync(path) ){

            try {
                unlinkSync(path);
            } catch (err) {
                return false;
            }

            return true;
        }

        return false;
    }

    /**
     * Delete folder
     * @param path
     */
    deleteFolder(path: string): boolean {

        const self = this;

        if( existsSync(path) ){

            try {

                readdirSync(path).forEach(function(entry) {
                    var entryPath = join(path, entry);
                    if( lstatSync(entryPath).isDirectory() ){
                        self.deleteFolder(entryPath);
                    } else {
                        unlinkSync(entryPath);
                    }
                });

                rmdirSync(path);

            } catch (err) {
                return false;
            }

            return true;
        }

        return false;
    }

}