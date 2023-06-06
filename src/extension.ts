'use strict';

import { ExtensionContext, window, workspace, commands } from 'vscode';
import { NotesExplorerCommands } from './commands';
import { NotesExplorerProvider } from './explorer';

/**
 * Activate method
 * @param {ExtensionContext} context
 */
export function activate(context: ExtensionContext): void {

    const provider = new NotesExplorerProvider();
    const cmd = new NotesExplorerCommands();

    window.registerTreeDataProvider(
        'notesExplorer', provider
    );

    // SNIPPETS API
    commands.registerCommand(
        'notesExplorer.refreshExplorer', function(){
        provider.refresh();
    });

    commands.registerCommand(
        'notesExplorer.openFile', function(resource){
        cmd.openFile(resource);
    });

    commands.registerCommand(
        'notesExplorer.addFile', async function(node){

        const path = (node) ? node.uri.path : "";
        if( await cmd.addFile(path) ){
            provider.refresh();
        }

    });

    commands.registerCommand(
        'notesExplorer.addFolder', async function(node){

        const path = (node) ? node.uri.path : "";
        if( await cmd.addFolder(path) ){
            provider.refresh();
        }

    });

    commands.registerCommand(
        'notesExplorer.deleteFile', async function(node){

        const path = (node) ? node.uri.path : "";
        if( await cmd.deleteFile(path) ){
            provider.refresh();
        }

    });

    commands.registerCommand(
        'notesExplorer.deleteFolder', async function(node){

        const path = (node) ? node.uri.path : "";
        if( await cmd.deleteFolder(path) ){
            provider.refresh();
        }

    });

    // CONFIGURATION
    commands.registerCommand(
        'notesExplorer.settings', function(){
        commands.executeCommand(
            'workbench.action.openSettings', 'notesbox.location'
        );
    });

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
    const workspaceRoot = workspace.getConfiguration()
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
export function deactivate(): void {
    return;
}