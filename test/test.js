import assert from 'assert';
import treefy from '../src';
import jsonld from 'jsonld';
import util from 'util';

describe('treefy', function(){
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
          "@container": "@list",
          "@type": "@id"
        },
        "name": "http://schema.org/name",
        "givenName": "http://schema.org/givenName",
        "affiliation": {
          "@id": "http://schema.org/affiliation",
          "@type": "@id"
        },
        "member": {
          "@id": "http://schema.org/member",
          "@container": "@set",
          "@type": "@id"
        },
        "Organization": "http://schema.org/Organization",
        "Person": "http://schema.org/Person",
        "ScholarlyArticle": "http://schema.org/ScholarlyArticle",
        "Role": "http://schema.org/Role"
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
          treefy('ex:article', flattened),
          (function rmBlankNodes(obj) {
            if (obj['@id'] && obj['@id'].startsWith('_:')) {
              delete obj['@id'];
            }
            for (let i in obj) {
              if (typeof obj[i] === 'object') {
                rmBlankNodes(obj[i]);
              }
            }
            return obj;
          })(framed['@graph'])[0]
        );
        done();

      });

    });


  });
});
