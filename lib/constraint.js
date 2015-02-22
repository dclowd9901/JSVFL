var Class = require('uberclass')
    _ = require('lodash');

module.exports = Class.extend({

  INSTRUCTIONS: {
    '<=': [
      'maxWidth',
      'maxHeight'
    ],
    '>=': [
      'minWidth',
      'minHeight'
    ],
    '==': [
      'sameWidth',
      'sameHeight'
    ],
    
    DIMENSIONS: [
      'width',
      'height'
    ],
    
    SPACING: 'spacing'
  },

  maxes: {
    maxWidth: 0,
    maxHeight: 1
  },

  dimensions: {
    width: 0,
    height: 1
  },

  DEFAULT_SPACING: 8,
},
{
  views: null,
  delegate: null,

  init: function(view) {
    this.views = [];

    if (view) {
      this.addView(view);
    }
  },

  addView: function(view) {
    if (this.views.length === 2) {
      // Lets ConstraintCollection know that it needs to generate a new Constraint
      this.delegate.constraintFull(view, this);
    } else {
      this.views.push({
        name: view,
        sizing: [] 
      });
      return this.views;
    }
  },

  lastView: function() {
    return _.last(this.views);
  },

  getOrientation: function() {
    return this.delegate.orientation;
  }
});

