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
        "Organization": {
          "@id": "http://schema.org/Organization",
          "@type": "@id"
        },
        "Person": {
          "@id": "http://schema.org/Person",
          "@type": "@id"
        },
        "ScholarlyArticle": {
          "@id": "http://schema.org/ScholarlyArticle",
          "@type": "@id"
        },
        "Role": {
          "@id": "http://schema.org/Role",
          "@type": "@id"
        }
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

      let tree = treefy('ex:article', flattened);
      assert.deepEqual(tree, {
        '@id': 'ex:article',
        '@type': 'ScholarlyArticle',
        author: [
          {
            '@type': 'Role',
            author: [
              {
                '@id': 'ex:peter',
                '@type': 'Person',
                affiliation: {
                  '@type': 'Organization',
                  member: [ 'ex:peter' ],
                  name: 'Merck'
                },
                givenName: 'Peter',
                name: 'Peter'
              }
            ]
          }
        ],
        sameAs: [ 'ex:a', 'ex:b' ]
      });

      done();
    });


  });
});
