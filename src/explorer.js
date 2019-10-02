'use strict';

const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

class SnippetsExplorerProvider {

	/**
	 * CONSTRUCTOR
	 */
	constructor(){

		this._onDidChangeTreeData = new vscode.EventEmitter();
		this.onDidChangeTreeData = this._onDidChangeTreeData.event;
		this.setWorkspaceRootPath();

	}

	/**
	 * Set snippets path
	 * @return {Boolean}
	 */
	setWorkspaceRootPath(){

		this.workspaceRoot = vscode.workspace
			.getConfiguration()
			.get('snippetsbox.location');

		if( !this.workspaceRoot ){

			vscode.window.showInformationMessage(
				'Snippets Box has not configured yet. Please configure Snippets Box path before.'
			);
			vscode.commands.executeCommand(
				'workbench.action.openSettings', '@ext:mateussouzaweb.snippetsbox'
			);

			return false;
		}

		return true;
	}

	/**
	 * Refresh tree view
	 * @return {void}
	 */
	refresh(){

		if( this.setWorkspaceRootPath() ){
			this._onDidChangeTreeData.fire();
		}

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
	 * Delete file
	 * @param {String} filePath
	 * @return {Boolean}
	 */
	deleteFile(filePath){

		if( this.pathExists(filePath) ){

			try {
				fs.unlinkSync(filePath);
				this.refresh();
			} catch (err) {
				return false;
			}

			return true;
		}

		return false;
	}

	/**
	 * Delete folder
	 * @param {String} folderPath
	 * @return {Boolean}
	 */
	deleteFolder(folderPath){

		var self = this;

		if( self.pathExists(folderPath) ){

			try {

				fs.readdirSync(folderPath).forEach(function(entry) {
					var entryPath = path.join(folderPath, entry);
					if( fs.lstatSync(entryPath).isDirectory() ){
						self.deleteFolder(entryPath);
					} else {
						fs.unlinkSync(entryPath);
					}
				});

				fs.rmdirSync(folderPath);
				self.refresh();

			} catch (err) {
				console.error(err);
				return false;
			}

			return true;
		}

		return false;
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

		const provider = new SnippetsExplorerProvider();

		vscode.window.registerTreeDataProvider(
			'snippetsExplorer', provider
			);

		// SNIPPETS API
		vscode.commands.registerCommand(
			'snippetsExplorer.refreshExplorer', function(){
			provider.refresh();
		});

		vscode.commands.registerCommand(
			'snippetsExplorer.addFile', function(node){
			//vscode.window.showInformationMessage(`Successfully called add snippet entry.`);
		});

		vscode.commands.registerCommand(
			'snippetsExplorer.addFolder', function(node){
			//.window.showInformationMessage(`Successfully aff edit snippet entry on ${node.label}.`);
		});

		vscode.commands.registerCommand(
			'snippetsExplorer.openFile', function(resource){
			vscode.window.showTextDocument(resource);
		});

		vscode.commands.registerCommand(
			'snippetsExplorer.deleteFile', function(node){
			provider.deleteFile(node.uri.path);
		});

		vscode.commands.registerCommand(
			'snippetsExplorer.deleteFolder', function(node){
			provider.deleteFolder(node.uri.path);
		});

		// CONFIGURATION
		context.subscriptions.push(
			vscode.workspace.onDidChangeConfiguration(function(e){

			if( e.affectsConfiguration('snippetsbox.location') ){
				provider.refresh();
			}

			})
		);

	}

}