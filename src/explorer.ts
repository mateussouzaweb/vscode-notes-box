'use strict';

import { readdirSync, statSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { Event, EventEmitter, workspace, TreeItem, FileType, TreeItemCollapsibleState, Uri, TreeDataProvider } from 'vscode';

export class NotesExplorerProvider implements TreeDataProvider<any> {

    private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();
    readonly onDidChangeTreeData: Event<any> = this._onDidChangeTreeData.event;
    private workspaceRoot: string;

    /**
     * CONSTRUCTOR
     * @param context
     */
    constructor() {
        this.setWorkspaceRoot();
    }

    /**
     * Set updated workspace root
     */
    setWorkspaceRoot(){

        const location = workspace.getConfiguration().get('notesbox.location') as string;
        const normalized = resolve(location);
        
        this.workspaceRoot = normalized;

    }

    /**
     * Refresh tree view
     */
    refresh(): void{
        this._onDidChangeTreeData.fire(undefined);
    }

    /**
     * Retrieve tree item
     * @param {any} element
     */
    getTreeItem(element: any): TreeItem{

        const treeItem = new TreeItem(
            element.uri,
            ( element.type === FileType.Directory )
                ? TreeItemCollapsibleState.Collapsed : TreeItemCollapsibleState.None
        );

        if( element.type === FileType.File ){

            treeItem.command = {
                command: 'notesExplorer.openFile',
                title: "Open File",
                arguments: [element.uri]
            };

            treeItem.contextValue = 'file';

        }else{

            treeItem.contextValue = 'folder';

        }

        treeItem.tooltip = element.name;

        return treeItem;
    }

    /**
     * Retrieve child entries
     * @param {any} element
     */
    getChildren(element: any): Promise<any>{

        if( !this.workspaceRoot ){
            return Promise.resolve([]);
        }

        let folder = join(this.workspaceRoot);
        if( element ){
            folder = join(this.workspaceRoot, element.name);
        }

        return Promise.resolve(
            this.readDirectory(folder)
        );
    }

    /**
     * @param {any} element
     */
    // getParent(element: any){
    //     return element;
    // }

    /**
     * Read directory and retrieve child elements
     * @param {string} folder
     */
    readDirectory(folder: string): Array<any>{

        if( !existsSync(folder) ){
            return [];
        }

        const children = [];
        const exclude = [".git", ".svn", ".hg", ".DS_Store"];

        readdirSync(folder, 'utf-8').forEach(function(filename: string | Buffer){

            if( exclude.includes(filename.toString()) ){
                return;
            }

            const stat = statSync(join(folder, filename.toString()));
            const type = stat.isDirectory() ? FileType.Directory : FileType.File;

            children.push([filename, type]);

        });

        children.sort(function(a, b){

            if( a[1] === b[1] ){
                return a[0].localeCompare(b[0]);
            }

            return a[1] === FileType.Directory ? -1 : 1;
        });

        return children.map(function(item){
            return {
                uri: Uri.file(join(folder, item[0])),
                name: item[0],
                type: item[1]
            };
        });
    }

}