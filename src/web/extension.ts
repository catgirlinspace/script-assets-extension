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
	let disposable = vscode.languages.registerHoverProvider(['lua', 'luau'], {
		async provideHover(document, position, token) {
			const range = document.getWordRangeAtPosition(position, /rbxassetid:\/\/\d+/); // regex is for rbxassetid://<ID HERE>
			if (!range) {
				return;
			}
			const word = document.getText(range);

			const id = /rbxassetid:\/\/(\d+)/.exec(word)?.[1];
			
			console.log(`Found ${id}, fetching thumbnail info...`);
			const response = await fetch(`https://grandiose-lumbar-aster.glitch.me/${id}`);
			const data = await response.json() as RobloxThumbnailResponse;
			const image = data.data?.[0]?.imageUrl;
			console.log(image);

			const mdString = new vscode.MarkdownString(`<img src="${image}" height="150px">`);
			mdString.supportHtml = true;
			return new vscode.Hover(mdString);
		}
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
