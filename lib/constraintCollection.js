var Class = require('uberclass'),
    Constraint = require('./constraint'),
    _ = require('lodash');

module.exports = Class.extend({
  ORIENTATIONS: {
    HORIZONTAL: 0,
    VERTICAL:   1
  }
}, 
{
  constraints: null,
  orientation: 0,

  init: function(constraint) {
    this.constraints = [];

    if (constraint) {
      this.addConstraint(constraint);
    }
  },

  addConstraint: function (constraint) {
    constraint.delegate = this;
    this.constraints.push(constraint);
    return constraint;
  },

  lastConstraint: function() {
    var result = _.last(this.constraints);

    if (!result) result = this.addConstraint(new Constraint());

    return result;
  },

  // From Constraint protocol
  constraintFull: function (view, constraint) {
    var lastConstraint = this.lastConstraint(),
        newConstraint = new Constraint();

    newConstraint.views.push(lastConstraint.views[1]);

    this.addConstraint(newConstraint);
    this.lastConstraint().addView(view);
  }
  // End
});