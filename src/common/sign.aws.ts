import { BinaryToTextEncoding, createHash, createHmac } from 'crypto';
import { stringify, parse } from 'querystring';

export const createCanonicalRequest = function (
  method,
  pathname,
  query,
  headers,
  payload,
) {
  return [
    method.toUpperCase(),
    pathname,
    createCanonicalQueryString(query),
    createCanonicalHeaders(headers),
    createSignedHeaders(headers),
    payload,
  ].join('\n');
};

export const createCanonicalQueryString = function (params) {
  return Object.keys(params)
    .sort()
    .map(function (key) {
      return `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`;
    })
    .join('&');
};

export const createCanonicalHeaders = function (headers) {
  return Object.keys(headers)
    .sort()
    .map(function (name) {
      return `${name
        .toLowerCase()
        .trim()}:${headers[name].toString().trim()}\n`;
    })
    .join('');
};

export const createSignedHeaders = function (headers) {
  return Object.keys(headers)
    .sort()
    .map(function (name) {
      return name.toLowerCase().trim();
    })
    .join(';');
};

export const createCredentialScope = function (time, region, service) {
  return [toDate(time), region, service, 'aws4_request'].join('/');
};

export const createStringToSign = function (time, region, service, request) {
  return [
    'AWS4-HMAC-SHA256',
    toTime(time),
    createCredentialScope(time, region, service),
    hash(request, 'hex'),
  ].join('\n');
};

export const createSignature = function (
  secret,
  time,
  region,
  service,
  stringToSign,
) {
  const h1 = hmac(`AWS4${secret}`, toDate(time)); // date-key
  const h2 = hmac(h1, region); // region-key
  const h3 = hmac(h2, service); // service-key
  const h4 = hmac(h3, 'aws4_request'); // signing-key
  return hmac(h4, stringToSign, 'hex');
};

export const createPresignedS3URL = function (name, options) {
  options = options || {};
  options.method = options.method || 'GET';
  options.bucket = options.bucket || process.env.AWS_S3_BUCKET;
  return createPresignedURL(
    options.method,
    `${options.bucket}.s3.amazonaws.com`,
    `/${name}`,
    's3',
    'UNSIGNED-PAYLOAD',
    options,
  );
};

export const createPresignedURL = function (
  method,
  host,
  path,
  service,
  payload,
  options,
) {
  options = options || {};
  options.key = options.key || process.env.MQTT_IOT_ACCESS_KEY;
  options.secret = options.secret || process.env.MQTT_IOT_SECRET_ACCESS_KEY;
  options.protocol = options.protocol || 'https';
  options.headers = options.headers || {};
  options.timestamp = options.timestamp || Date.now();
  options.region = options.region || process.env.AWS_REGION || 'us-east-1';
  options.expires = options.expires || 86400; // 24 hours
  options.headers = options.headers || {};

  // host is required
  options.headers.Host = host;

  const query = options.query ? parse(options.query) : {};
  query['X-Amz-Algorithm'] = 'AWS4-HMAC-SHA256';
  query['X-Amz-Credential'] = `${options.key}/${createCredentialScope(
    options.timestamp,
    options.region,
    service,
  )}`;
  query['X-Amz-Date'] = toTime(options.timestamp);
  query['X-Amz-Expires'] = options.expires;
  query['X-Amz-SignedHeaders'] = createSignedHeaders(options.headers);

  const canonicalRequest = createCanonicalRequest(
    method,
    path,
    query,
    options.headers,
    payload,
  );
  const stringToSign = createStringToSign(
    options.timestamp,
    options.region,
    service,
    canonicalRequest,
  );
  const signature = createSignature(
    options.secret,
    options.timestamp,
    options.region,
    service,
    stringToSign,
  );
  query['X-Amz-Signature'] = signature;

  if (options.sessionToken) {
    query['X-Amz-Security-Token'] = options.sessionToken;
  }

  return `${options.protocol}://${host}${path}?${stringify(query)}`;
};

function toTime(time: Date) {
  // eslint-disable-next-line no-useless-escape
  return new Date(time).toISOString().replace(/[:\-]|\.\d{3}/g, '');
}

function toDate(time: Date) {
  return toTime(time).substring(0, 8);
}

function hmac(key: string, string: string, encoding?: BinaryToTextEncoding) {
  return createHmac('sha256', key).update(string, 'utf8').digest(encoding);
}

function hash(string: string, encoding: BinaryToTextEncoding) {
  return createHash('sha256').update(string, 'utf8').digest(encoding);
}
