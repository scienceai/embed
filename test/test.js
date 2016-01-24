import assert from 'assert';
import embed from '../src';
import jsonld from 'jsonld';
import util from 'util';

describe('embed', function() {
  it('should create a tree from a graph', function(done) {
    let doc = {
      "@context": {
        "ex": "http://example.com",
        "sameAs":  {
          "@id": "http://schema.org/sameAs",
          "@container": "@list",
          "@type": "@id"
        },
        "author": {
          "@id": "http://schema.org/author",
          "@type": "@id"
        },
        "name": "http://schema.org/name",
        "givenName": "http://schema.org/givenName",
        "affiliation": "http://schema.org/affiliation",
        "member": {
          "@id": "http://schema.org/member",
          "@container": "@set",
          "@type": "@id"
        },
        "Organization": "http://schema.org/Organization",
        "Person": "http://schema.org/Person",
        "ScholarlyArticle": "http://schema.org/ScholarlyArticle",
        "Role": "http://schema.org/Role",
        "datePublished": "http://schema.org/datePublished"
      },
      "@id": "ex:article",
      "@type": "ScholarlyArticle",
      "sameAs": ["ex:a", "ex:b"],
      "author": {
        "@type": "Role",
        "author": {
          "@id": "ex:peter",
          "@type": "Person",
          "name": "Peter",
          "affiliation": {
            "@type": "Organization",
            "name": "Merck",
            "member": {
              "@id": "ex:peter",
              "@type": "Person",
              "name": "Peter",
              "givenName": "Peter"
            }
          }
        }
      }
    };

    jsonld.flatten(doc, {'@context': doc['@context']}, function(err, flattened) {
      if (err) throw err;

      let frame = {
        '@context': doc['@context'],
        '@embed': '@always',
        '@type': 'ScholarlyArticle'
      };

      jsonld.frame(flattened, frame, {omitDefault: true}, function(err, framed) {
        if (err) throw err;
        assert.deepEqual(
          embed('ex:article', flattened),
          framed['@graph'][0]
        );
        done();
      });
    });

  });
});
