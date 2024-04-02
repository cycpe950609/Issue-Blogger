# Issue Blogger
Render/Manage Blog using Github's Issue.

## Online demo
* Url : [https://issue-blogger.vercel.app/](https://issue-blogger.vercel.app/)

## How to RUN ?

1. Put a .env file in the root of the project with the following environment variables

    |               變數                 |               說明                                                            |
    | --------------------------------- | ------------------------------------------------------------------------------|
    | GITHUB_CLIENT_ID                  | Client ID provided by GitHub when registing a OAUTH App                       |
    | GITHUB_CLIENT_SECRET              | Client Secret provided by GitHub when registing a OAUTH App                   |
    | GITHUB_UNAUTHENTICATED_TOKEN      | A Fine-grained personal access tokens for unauthenticated to access blogger   |
    | GITHUB_ISSUE_BLOGGER_USERNAME     | The owner of the repo                                                         |
    | GITHUB_ISSUE_BLOGGER_REPO_NAME    | The repo used as Blogger                                                      |


2. Run at root of project

    *  `npm run dev`

3. Open the site `http://localhost:3000`

## Project architecture

### There are four valid path:
1. /       : Root. List the post.
2. /viewer : Viewer. View the sepicific post. Viewer is a modal over on List.
3. /editor : Post Editor. Editor for creating/modifing postes. Editor is a modal over on List.
4. /login  : Login page. The page is used to validate if the user login sucessfully.

#### NOTE: 
* Modal is a slot of next.js layout

### `utils` directory

The directory provide some shared component/helper.

### App structure

* Server part:
    1. Github (utils/github.ts) : Interactive with Github REST API (Get AccessToken, Load Issue, Update Issue, etc)
    2. ErrorHandler (utils/errorHandlerServer.ts) : Each function provided by server should return corresponed status code and message. The unexpected error is hidden from return message.

* UI part (include server component):
    1. LoginState (utils/LoginStateContext.tsx) : Store the login state (is user login ?, is user is owner of the viewed repo) globally
    2. BloggerList (utils/BloggerListContext.tsx) : Global `post` manager (List, Update, Delete, etc)
    3. /       (page.tsx): List the post information stored in BloggerListContext.
    4. /viewer (@modal/viewer/page.tsx): Viewer. Download post title/body from server 
    5. /editor (@modal/editor/page.tsx): Post Editor. Validate length of title/body before sent to server
    6. /login  (login/page.tsx): Login page. Redirect to Github when no valid `access_token`/`code`. Get `access_token` if has `code` in URLSearchParames. Validate `access_token` when present in cookies.
    7. ErrorHandler (utils/errorHandlerClient.ts) : Handle the response from server. Redirect/Get response data according to the status code.


