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
    
console.log(vflParser('V:|-[find]-[findNext(200)]-50-[findField(>=20,<=100)]-|'));

/**
  {
    orientation: 1, // ENUM for vertical orientation
    constraints: [{
      views: [{
        name: 'superView',
        sizing: [],
        spacing: {
          margin: 'bottom',
          value: 8
        }
      },
      {
        name: 'find',
        sizing: [],
        spacing: {
          margin: 'bottom',
          value: 8
        }
      }]
    },
    {
      views: [{
        name: 'find',
        sizing: [],
        spacing: {
          margin: 'bottom',
          value: 8
        }
      },
      {
        name: 'findNext',
        sizing: [{
          relation: 'height',
          value: 200
        }],
        spacing: {
          margin: 'bottom'
          value: 50
        }
      }]
    },
    {
      views: [{
        name: 'findNext',
        sizing: [{
          relation: 'height',
          value: 200
        }],
        spacing: {
          margin: 'bottom',
          value: 50
        }
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
        }],
        spacing: {
          margin: 'bottom',
          value: 8
        }
      }
    },
    {
      views: [{
        name: 'findField',
        sizing: [{
          relation: 'minHeight',
          value: 20
        },
        {
          relation: 'maxHeight',
          value: 100
        }],
        spacing: {
          margin: 'bottom',
          value: 8
        }
      },
      {
        name: 'parentView',
        sizing: []
      }]
    }]
  }
 */
```
