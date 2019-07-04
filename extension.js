'use strict';

const vscode = require('vscode');
const SnippetsExplorer = require('./src/explorer.js');

/**
 * Activate method
 * @param {vscode.ExtensionContext} context
 * @return {void}
 */
function activate(context) {
	new SnippetsExplorer(context);
}
exports.activate = activate;

/**
 * Deactivate method
 * @return {void}
 */
function deactivate(){

}

module.exports = {
	activate,
	deactivate
}
