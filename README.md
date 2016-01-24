# embed

Context free tree creation out of flattened JSON-LD documents.

## Introduction to JSON-LD framing

Consider the following JSON-LD document:

```
{
  "@context": "https://science.ai",
  "hasPart": [
    {
      "@id": "scienceai:imageId",
      "@type": "Image",
      "name": "resource 1",
      "author": {
        "@id": "scienceai:authorId",
        "@type": "Person",
        "email": "mailto:peter@example.com",
        "name": "Peter"
      }
    },
    {
      "@id": "scienceai:datasetId",
      "@type": "Dataset",
      "author": "scienceai:authorId"
    }
  ]
}
```

Note that in the dataset, the author is not repeated but simply
referenced by its `@id` (`scienceai:authorId`).

This document can be **flattened**:

```
{
  "@context": "https://science.ai",
  "@graph": [
    {
      "@id": "_:b0",
      "hasPart": [
        "scienceai:imageId",
        "scienceai:datasetId"
      ]
    },
    {
      "@id": "scienceai:authorId",
      "@type": "Person",
      "email": "mailto:peter@example.com",
      "name": "Peter"
    },
    {
      "@id": "scienceai:datasetId",
      "@type": "Dataset",
      "author": "scienceai:authorId"
    },
    {
      "@id": "scienceai:imageId",
      "@type": "Image",
      "author": "scienceai:authorId",
      "name": "resource 1"
    }
  ]
}
```

Note that the nodes that did not have `@id` are now blank nodes (e.g.,
`_:b0`).

The flattened form of the document is an efficient way to store a
normalized version of the document.

From the flatten form, trees can be reconstructed using **framing**:


For instance to recreate the `Dataset` the following frame can be used:

```
{
  "@context": "https://science.ai",
  "@embed": "@always",
  "@type": "Dataset"
}
```

leading to:

```
{
  "@context": "https://science.ai",
  "@graph": [
    {
      "@id": "scienceai:datasetId",
      "@type": "Dataset",
      "author": {
        "@id": "scienceai:authorId",
        "@type": "Person",
        "email": "mailto:peter@example.com",
        "name": "Peter"
      }
    }
  ]
}
```

default value can be specified, for instance the frame:

```
{
  "@context": "https://science.ai",
  "@embed": "@always",
  "@type": "Dataset",
  "isPartOf": {
    "@default": "scienceai:bundleId"
  }
}
```

will generate:

```
{
  "@context": "https://science.ai",
  "@graph": [
    {
      "@id": "scienceai:datasetId",
      "@type": "Dataset",
      "author": {
        "@id": "scienceai:authorId",
        "@type": "Person",
        "email": "mailto:peter@example.com",
        "name": "Peter"
      },
      "isPartOf": "scienceai:bundleId"
    }
  ]
}
```

If `@type` are not known (not that `@type` can be a list), JSON-LD
framing support duck-typing.
For instance the frame:

```
{
  "@context": "https://science.ai",
  "@embed": "@always",
  "name": {}
}
```

will generate:

```
{
  "@context": "https://science.ai",
  "@graph": [
    {
      "@id": "scienceai:authorId",
      "@type": "Person",
      "name": "Peter",
      "email": "mailto:peter@example.com"
    },
    {
      "@id": "scienceai:imageId",
      "@type": "Image",
      "author": {
        "@id": "scienceai:authorId",
        "@type": "Person",
        "email": "mailto:peter@example.com",
        "name": "Peter"
      },
      "name": "resource 1"
    }
  ]
}
```


Framing can also be used to extract only specific values from a
`@graph`:

The frame:

```
{
  "@context": "https://science.ai",
  "@embed": "@always",
  "@type": "Person",
  "@explicit": true,
  "email": {}
}

```

will result in:

```
{
  "@context": "https://science.ai",
  "@graph": [
    {
      "@id": "scienceai:authorId",
      "@type": "Person",
      "email": "mailto:peter@example.com"
    }
  ]
}
```

## `embed`

`embed` can be used to re-create trees from the nodes of a JSON-LD
flattened document. `embed` is not as flexible as JSON-LD framing but
does not require a `@context` and can be performed efficiently as a
sync operation.


### API `embed(node, graph)`

```
import embed from '@scienceai/embed';

let tree = embed(node, graph);
```

- `graph`: the `@graph` from a flattened JSON-LD document. Note that
  the `@id` of the document nodes must be valid CURIEs (including
  blank nodes) or URLs.
- `node`: A node of the graph (or an `@id` as a string).
