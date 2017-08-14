# FileDepot

FileDepot is an open-sourced and self-managed file storage API service.

An API server is needed to create tokens for users on the clients to interact directly with the storage server.

Basic operations include:

  - Creation of one-time tokens for protected access to server storage directly from the browser
  - Upload / delete files on the server with tokens

## Coming Soon

- CLI Tool to manage buckets and access keys to buckets
- HEAD method to provide information about a given file in a bucket
- Large file (in parts) support

## Use Cases

When Bob wants to upload a PDF document to your website, Bob opens your website's file uploader. Before the file uploader page was served to Bob,
your web server uses the access key to talk to a FileDepot instance to create an one-time-use access token. The token is then given to Bob's web browser
when the file uploader page is served. When Bob chooses the PDF file and clicks on the "Upload" button, the file - along with the access token - is sent from
Bob's computer directly to FileDepot. FileDepot will check to ensure that the token was created to put a file in the corresponding bucket managed by FileDepot. If
the access token checks out fine, the file is placed in the Bucket's path on the server's file system and the file name is returned to the browser for further processing.

## Requirements

- NodeJS >= v6.3.0
- A DBMS supported by [Sequelize](http://docs.sequelizejs.com/)
- Storage location that can be read from or written to by FileDepot when deployed

## API References

All API endpoints are prefixed with `/v1` to impose versioning on the API.

### Creating an Access Token

Method/URI: `POST /tokens`

Headers:

- `Authorization`: The access key ID and access key secret must be supplied in this field by concatenating both the key ID and secret with a full stop. (e.g. If access key ID is 'ABC' and secret is '123', then the field should be set to 'ABC.123')

Parameters (Body):

- `userAgent`: The client's user agent property
- `ipAddress`: The client's IP address
- `method`: Comma-separated methods that the client is able to access using this token. (e.g. `PUT` or `PUT,DELETE`)
- `filename`: The filename that the token can access. If this is meant for a file upload, this field may be left empty.

Response (JSON):

- `status`: Can be either "ok" or "error".
- `result`: If successful, a JsonWebToken access token is returned in this field.
- `msg`: If an error occurred, this field contains more information about the error.

## License

The project is open-sourced under MIT License.
