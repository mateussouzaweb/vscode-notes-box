'use strict';

import { homedir } from "os";
import { resolve } from "path";
import { workspace } from "vscode";

/**
 * Retrieve configured notes root path
 * @returns 
 */
export function getRootPath() {

    let location = workspace.getConfiguration().get('notesbox.location') as string;
    location = location.replace('~', homedir());
    location = location.replace('${HOME}', homedir());
    location = resolve(location);

    return location;
}