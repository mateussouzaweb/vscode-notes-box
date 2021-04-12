'use strict';

import { ExtensionContext, window, workspace, commands } from 'vscode';
import { NotesExplorerProvider } from './explorer';

/**
 * Activate method
 * @param {ExtensionContext} context
 */
export function activate(context: ExtensionContext): void {

    const provider = new NotesExplorerProvider();

    window.registerTreeDataProvider(
        'notesExplorer', provider
    );

    // SNIPPETS API
    commands.registerCommand(
        'notesExplorer.refreshExplorer', function(){
        provider.refresh();
    });

    commands.registerCommand(
        'notesExplorer.addFile', function(node){
        window.showInformationMessage(`Successfully called add file entry ${node}.`);
    });

    commands.registerCommand(
        'notesExplorer.addFolder', function(node){
        window.showInformationMessage(`Successfully called add folder on ${node.label}.`);
    });

    commands.registerCommand(
        'notesExplorer.openFile', function(resource){
        window.showTextDocument(resource);
    });

    commands.registerCommand(
        'notesExplorer.deleteFile', function(node){
        provider.deleteFile(node.uri.path);
    });

    commands.registerCommand(
        'notesExplorer.deleteFolder', function(node){
        provider.deleteFolder(node.uri.path);
    });

    commands.registerCommand(
        'notesExplorer.settings', function(){
        commands.executeCommand(
            'workbench.action.openSettings', 'notesbox.location'
        );
    });

    // CONFIGURATION
    context.subscriptions.push(
        workspace.onDidChangeConfiguration(function(e){

            if( e.affectsConfiguration('notesbox.location') ){
                provider.setWorkspaceRoot();
                provider.refresh();
            }

            if( e.affectsConfiguration('files.exclude') ){
                provider.refresh();
            }

        })
    );

    // STARTUP
    var workspaceRoot = workspace.getConfiguration()
        .get('notesbox.location');

    if( !workspaceRoot ){

        window.showInformationMessage(
            'Notes Box folder location has not been configured yet. Please configure the notes folder path.',
            "Open Settings"
        )
        .then(function(){
            commands.executeCommand('notesExplorer.settings');
        });

    }

}

/**
 * Deactivate method
 */
export function deactivate(): void{

}