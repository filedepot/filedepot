![FileDepot](http://i.imgur.com/lYOpp7J.png)

FileDepot is a self-managed object storage API service.

Goals:

  - To provide an easy to set up self-managed service for managing file uploads over the internet.
  - To reduce load on web server by directly performing file from client's web browser to FileDepot's server.
  - To provide a simple RESTful API that uses concepts similar to S3.

Operations include:

  - Creation of one-time tokens for protected access to server storage directly from the browser
  - Upload / delete files on the server with tokens
  - Retrieving uploaded files via HTTP(S)

## Coming Soon

- CLI Tool to manage buckets and access keys to buckets
- HEAD method to provide information about a given file in a bucket
- Large file (in parts) support

## Use Cases

### Managing Upload Trust via One-Time Access Tokens

![Architecture](http://i.imgur.com/lFbbBOp.gif)

When Bob wants to upload a PDF document to your website, Bob opens your website's file uploader. (1) Before the file uploader page was served to Bob,
your web server uses its access key to request FileDepot to create an one-time-use access token. (2) The token is then given to Bob's web browser
when the file uploader page is served. (3) When Bob chooses the PDF file and clicks on the "Upload" button, the file - along with the access token - is sent from
Bob's computer directly to FileDepot. If the access token checks out fine, the file is placed in the Bucket's path on the server's file system.

### Serving Files

In most use cases, objects are retrievable through FileDepot's `GET /buckets/:bucketId/objects/:objectName` API. However throughput on file uploading and authentication can be improved when object retrieval is delegated to a secondary static web server as shown in the example below.

![Architecture 2](http://i.imgur.com/ijEA8dy.gif)

Using a secondary web server may also provide greater controls over caching parameters. You may even decide to serve the files through a CDN.

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
