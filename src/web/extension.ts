// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

interface RobloxThumbnailResponse {
	data?: [
		{
			targetId?: number;
			state?: "Error" | "Completed" | "InReview" | "Pending" | "Blocked";
			imageUrl?: string;
		}
	]
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "script-assets-web" is now active in the web extension host!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.languages.registerHoverProvider('*', {
		async provideHover(document, position, token) {
			const range = document.getWordRangeAtPosition(position, /rbxassetid:\/\/\d+/); // regex is for rbxassetid://<ID HERE>
			if (!range) {
				return;
			}
			const word = document.getText(range);

			const id = /rbxassetid:\/\/(\d+)/.exec(word)?.[1];
			
			console.log(`Found ${id}, fetching thumbnail info...`);
			/*
				I would like to request thumbnails.roblox.com directly here.
				Unfortunately, it's not possible to do so.
				Roblox's API doesn't return CORS header so the request is blocked.
				This glitch app is just a little Node.js app that fetches the thumbnail info from Roblox's API and returns it with CORS headers.
				The only thing sent to this app is the ID of the asset and the app doesn't log anything. It's even open source at https://glitch.com/~grandiose-lumbar-aster
			*/
			const response = await fetch(`https://grandiose-lumbar-aster.glitch.me/${id}`);
			const data = await response.json() as RobloxThumbnailResponse;
			const image = data.data?.[0]?.imageUrl;
			console.log(image);

			const mdString = new vscode.MarkdownString(`<img src="${image}" height="150px" width="150px">`);
			mdString.supportHtml = true;
			return new vscode.Hover(mdString);
		}
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
