'use strict';

const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

class SnippetsExplorerProvider {

	/**
	 * CONSTRUCTOR
	 * @param {string} workspaceRoot
	 */
	constructor(workspaceRoot){

		this.workspaceRoot = workspaceRoot;
		this._onDidChangeTreeData = new vscode.EventEmitter();
		this.onDidChangeTreeData = this._onDidChangeTreeData.event;

	}

	/**
	 * Refresh tree view
	 * @return {void}
	 */
	refresh(){
		this._onDidChangeTreeData.fire();
	}

	/**
	 * Retrieve tree item
	 * @param {any} element
	 * @return {vscode.TreeItem}
	 */
	getTreeItem(element){

		var treeItem = new vscode.TreeItem(
			element.uri,
			( element.type === vscode.FileType.Directory )
				? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
		);

		if( element.type === vscode.FileType.File ){

			treeItem.command = {
				command: 'snippetsExplorer.openFile',
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
	 * @return {Promise}
	 */
	getChildren(element){

		if( !this.workspaceRoot ){
			vscode.window.showInformationMessage('Snippets Box has not configured yet. Please configure Snippets Box folder before and restart your editor');
			return Promise.resolve([]);
		}

		var folder = path.join(this.workspaceRoot);

		if( element ){
			folder = path.join(this.workspaceRoot, element.name);
		}

		return Promise.resolve(
			this.readDirectory(folder)
		);
	}

	// /**
	//  * @param {any} element
	//  */
	// getParent(element){
	// 	return element;
	// }

	/**
	 * Read directory and retrieve child elements
	 * @param {string} folder
	 * @return {Array}
	 */
	readDirectory(folder){

		if( !this.pathExists(folder) ){
			return [];
		}

		var children = [];

		fs.readdirSync(folder, 'utf-8').forEach(function(filename){

			var stat = fs.statSync(path.join(folder, filename));
			var type = stat.isDirectory() ? vscode.FileType.Directory : vscode.FileType.File;

			children.push([filename, type]);

		});

		children.sort(function(a, b){

			if( a[1] === b[1] ){
				return a[0].localeCompare(b[0]);
			}

			return a[1] === vscode.FileType.Directory ? -1 : 1;
		});

		return children.map(function(item){
			return {
				uri: vscode.Uri.file(path.join(folder, item[0])),
				name: item[0],
				type: item[1]
			};
		});
	}

	/**
	 * Check if path exists
	 * @param {string} thePath
	 * @return {boolean}
	 */
	pathExists(thePath){

		try {
			fs.accessSync(thePath);
		} catch (err) {
			return false;
		}

		return true;
	}

};

module.exports = class SnippetsExplorer{

	/**
	 * CONSTRUCTOR
	 * @param {vscode.ExtensionContext} context
	 */
	constructor(context){

		const snippetsPath = vscode.workspace.getConfiguration().get('snippetsbox.location');
		const provider = new SnippetsExplorerProvider(snippetsPath);

		vscode.window.registerTreeDataProvider('snippetsExplorer', provider);

		vscode.commands.registerCommand('snippetsExplorer.refreshExplorer', function(){
			//vscode.window.showInformationMessage(`Successfully called refresh snippets.`);
			provider.refresh();
		});

		vscode.commands.registerCommand('snippetsExplorer.addFile', function(node){
			//vscode.window.showInformationMessage(`Successfully called add snippet entry.`);
		});

		vscode.commands.registerCommand('snippetsExplorer.addFolder', function(node){
			//.window.showInformationMessage(`Successfully aff edit snippet entry on ${node.label}.`);
		});

		vscode.commands.registerCommand('snippetsExplorer.openFile', function(resource){
			//vscode.window.showInformationMessage(`Successfully called open snippet entry.`);
			vscode.window.showTextDocument(resource);
		});

		vscode.commands.registerCommand('snippetsExplorer.deleteFile', function(node){
			vscode.window.showInformationMessage(`Successfully called delete snippet file on ${node.label}.`);
		});

		vscode.commands.registerCommand('snippetsExplorer.deleteFolder', function(node){
			vscode.window.showInformationMessage(`Successfully called delete snippet folder on ${node.label}.`);
		});

	}

}