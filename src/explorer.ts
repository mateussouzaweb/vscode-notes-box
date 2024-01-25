'use strict';

import { readdirSync, statSync, existsSync } from 'fs';
import { join } from 'path';
import { Event, EventEmitter, TreeItem, FileType, TreeItemCollapsibleState, Uri, TreeDataProvider } from 'vscode';
import { getRootPath, isInExclusionList } from './lib';

export class NotesExplorerProvider implements TreeDataProvider<any> {

    private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();
    readonly onDidChangeTreeData: Event<any> = this._onDidChangeTreeData.event;

    /**
     * Refresh tree view
     */
    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }

    /**
     * Retrieve tree item
     * @param {any} element
     */
    getTreeItem(element: any): TreeItem {

        const treeItem = new TreeItem(
            element.uri,
            (element.type === FileType.Directory)
                ? TreeItemCollapsibleState.Collapsed : TreeItemCollapsibleState.None
        );

        if (element.type === FileType.File) {

            treeItem.command = {
                command: 'notesExplorer.openFile',
                title: "Open File",
                arguments: [element.uri]
            };

            treeItem.contextValue = 'file';

        } else {

            treeItem.contextValue = 'folder';

        }

        treeItem.tooltip = element.name;

        return treeItem;
    }

    /**
     * Retrieve child entries
     * @param {any} element
     */
    getChildren(element: any): Promise<any> {

        const workspaceRoot = getRootPath();
        if (!workspaceRoot) {
            return Promise.resolve([]);
        }

        let folder = join(workspaceRoot);
        if (element) {
            folder = join(workspaceRoot, element.relative);
        }

        return Promise.resolve(this.readDirectory(
            workspaceRoot,
            folder
        ));
    }

    /**
     * @param {any} element
     */
    // getParent(element: any){
    //     return element;
    // }

    /**
     * Read directory and retrieve children elements
     * @param {string} root
     * @param {string} folder
     */
    readDirectory(root: string, folder: string): Array<any> {

        if (!existsSync(folder)) {
            return [];
        }

        const children = [];
        readdirSync(folder, 'utf-8').forEach(function (filename: string | Buffer) {

            const file = join(folder, filename.toString());
            const relative = file.replace(root, '');

            if (isInExclusionList(relative)) {
                return;
            }

            const stat = statSync(file);
            const type = stat.isDirectory() ? FileType.Directory : FileType.File;
            const item = {
                uri: Uri.file(file),
                relative: relative,
                name: filename,
                type: type
            };

            children.push(item);

        });

        children.sort(function (a, b) {

            if (a.type === b.type) {
                return a.relative.localeCompare(b.relative);
            }

            return a.type === FileType.Directory ? -1 : 1;
        });

        return children;
    }

}