# JSVFL
Javascript VFL Parser/AST Generator

Install
=======

`npm install jsvfl`

Use
===

```
var JSVFL = require('jsvfl');

//...

var vflParser = new JSVFL();
    
console.log(vflParser('V:|-[find]-[findNext(200)]-[findField(>=20,<=100)]-|'));

/**
  {
    orientation: 1, // ENUM for vertical orientation
    constraints: [{
      instruction: 'spacing',
      value: 8
      views: [{
        name: 'superView',
        sizing: []
      },
      {
        name: 'find',
        sizing: []
      }]
    },
    {
      instruction: 'spacing',
      value: 8,
      views: [{
        name: 'find',
        sizing: []
      },
      {
        name: 'findNext',
        sizing: [{
          relation: 'height',
          value: 200
        }]
      }]
    },
    {
      instruction: 'spacing',
      value: 8,
      views: [{
        name: 'findNext',
        sizing: []
      },
      {
        name: 'findField',
        sizing: [{
          relation: 'minHeight',
          value: 20
        },
        {
          relation: 'maxHeight',
          value: 100
        }]
      }
    },
    {
      instruction: 'spacing',
      value: 8,
      views: [{
        name: 'findField',
        sizing: []
      },
      {
        name: 'parentView',
        sizing: []
      }]
    }]
  }
 */
```
