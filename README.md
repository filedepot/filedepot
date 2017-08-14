# Timebolt

Timebolt is an open-sourced and self-managed file storage API service.

An API server is needed to create tokens for users on the clients to interact directly with the storage server.

Basic operations include:

  - Creation of one-time tokens for protected access to server storage directly from the browser
  - Upload / delete files on the server with tokens

## Use Cases

When Bob wants to upload a PDF document to your website, Bob opens your website's file uploader. Before the file uploader page was served to Bob,
your web server uses the access key to talk to a Timebolt instance to create an one-time-use access token. The token is then given to Bob's web browser
when the file uploader page is served. When Bob chooses the PDF file and clicks on the "Upload" button, the file - along with the access token - is sent from
Bob's computer directly to Timebolt. Timebolt will check to ensure that the token was created to put a file in the corresponding bucket managed by Timebolt. If
the access token checks out fine, the file is placed in the Bucket's path on the server's file system and the file name is returned to the browser for further processing.

## License

The project is open-sourced under MIT License.
