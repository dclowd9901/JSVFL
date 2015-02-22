  var Class = require('uberclass'),
    _ = require('lodash'),
    Constraint = require('./constraint'),
    ConstraintCollection = require('./constraintCollection');

module.exports = Class.extend({
  superviewTokens:   /^\|/g,
  viewTokens:        /^\[|^\]/g,
  connectionTokens:  /^\-/g,
  orientationTokens: /^(H):|^(V):/g,
  predicateTokens:   /^\(|^\)/g,
  listTokens:        /^,/g,
  relationTokens:    /^<=|^>=|^==/g,
  priorityTokens:    /^@/g,
  numberTokens:      /^\d+/g,
  referenceTokens:   /^\w+/g,

  TYPES: {
    SUPERVIEW:   0,
    VIEW:        1,
    CONNECTION:  2,
    ORIENTATION: 3,
    PREDICATE:   4,
    LIST:        5, 
    RELATION:    6,
    PRIORITY:    7,
    NUMBER:      8,
    REFERENCE:   9
  },

  vfl: null,

  parse: function(vfl) {
    this.vfl = vfl;
    return this.constraintWalker();
  },

  chunkVfl: function(re) {
    this.vfl = this.vfl.slice(re.lastIndex);
    re.lastIndex = 0; 
  },

  sizingConstraintWalker: function(lastType, parentConstraint, sizeConstraint) {
    parentConstraint = parentConstraint || [];
    sizeConstraint = sizeConstraint || {};

    switch (lastType) {
      case this.TYPES.PREDICATE:

      // (<=|>=|==
      if (result = this.relationTokens.exec(this.vfl)) {
        sizeConstraint.relation = Constraint.INSTRUCTIONS[result[0]][parentConstraint.getOrientation()];

        this.chunkVfl(this.relationTokens);

        return this.sizingConstraintWalker(
          this.TYPES.RELATION,
          parentConstraint,
          sizeConstraint
        );

        break;
      }

      // (:NUMBER:
      if (result = this.numberTokens.exec(this.vfl)) {

        sizeConstraint.value = parseInt(result[0], 10);
        sizeConstraint.relation = sizeConstraint.relation ||
                                  Constraint.INSTRUCTIONS.DIMENSIONS[parentConstraint.getOrientation()];

        this.chunkVfl(this.numberTokens);

        return this.sizingConstraintWalker(
          this.TYPES.NUMBER,
          parentConstraint,
          sizeConstraint
        );

        break;
      }

      break;

      case this.TYPES.RELATION: 

      // <=|>=:NUMBER:
      if (result = this.numberTokens.exec(this.vfl)) {        
        sizeConstraint.value = parseInt(result[0], 10);

        this.chunkVfl(this.numberTokens);

        return this.sizingConstraintWalker(
          this.TYPES.NUMBER,
          parentConstraint,
          sizeConstraint
        );

        break;
      }

      // ==:VIEW:
      if (result = this.referenceTokens.exec(this.vfl)) {

        sizeConstraint.value = result[0];

        this.chunkVfl(this.referenceTokens);

        return this.sizingConstraintWalker(
          this.TYPES.REFERENCE,
          parentConstraint,
          sizeConstraint
        );

        break;
      }

      break;


      case this.TYPES.LIST:

      // ,<=|=>|==
      if (result = this.relationTokens.exec(this.vfl)) {
        sizeConstraint.relation = Constraint.INSTRUCTIONS[result[0]][parentConstraint.getOrientation()];
        
        this.chunkVfl(this.relationTokens);

        return this.sizingConstraintWalker(
          this.TYPES.RELATION,
          parentConstraint,
          sizeConstraint
        );
      }

      // ,:NUMBER
      if (result = this.numberTokens.exec(this.vfl)) {
        this.chunkVfl(this.numberTokens);

        sizeConstraint.value = parseInt(result[0], 10);
        sizeConstraint.relation = sizeConstraint.relation || 
                                  Constraint.INSTRUCTIONS.DIMENSIONS[parentConstraint.getOrientation()];

        return this.sizingConstraintWalker(
          this.TYPES.NUMBER, 
          parentConstraint, 
          sizeConstraint
        );
        break;
      }

      break;

      case this.TYPES.NUMBER:

      // :NUMBER:@
      if (result = this.priorityTokens.exec(this.vfl)) {
        this.chunkVfl(this.priorityTokens);

        sizeConstraint.priority = parseInt(result[0], 10);

        return this.sizingConstraintWalker(
          this.TYPES.PRIORITY, 
          parentConstraint, 
          sizeConstraint
        );
        break;
      }

      // :NUMBER:)
      if (result = this.predicateTokens.exec(this.vfl)) {
        this.chunkVfl(this.predicateTokens);
        parentConstraint.lastView().sizing.push(sizeConstraint);

        return parentConstraint;
      }

      // :NUMBER:,
      if (result = this.listTokens.exec(this.vfl)) {
        this.chunkVfl(this.listTokens);

        parentConstraint.lastView().sizing.push(sizeConstraint);

        return this.sizingConstraintWalker(
          this.TYPES.LIST, 
          parentConstraint,
          {}
        );

        break;
      }
    }
  },

  constraintWalker: function (lastType, constraints) {
    var result;

    constraints = constraints || new ConstraintCollection();

    if (this.vfl.length === 0) {
      return constraints;
    }

    if (lastType === undefined) {
      // H:|V:
      if (result = this.orientationTokens.exec(this.vfl)) {
        this.chunkVfl(this.orientationTokens);

        if (result[2] === 'V') {
          constraints.orientation = ConstraintCollection.ORIENTATIONS.VERTICAL;
        }

        return this.constraintWalker(undefined, constraints);
      // |
      } else if (this.superviewTokens.exec(this.vfl)) {
        this.chunkVfl(this.superviewTokens);

        constraints.lastConstraint().addView('parentView');

        return this.constraintWalker(this.TYPES.SUPERVIEW, constraints);

      // [         
      } else if (result = this.viewTokens.exec(this.vfl)) {
        this.chunkVfl(this.viewTokens);
        return this.constraintWalker(this.TYPES.VIEW, constraints);
      }
    } else {

      switch (lastType) {
        case this.TYPES.VIEW:

        // [:VIEW:
        if (result = this.referenceTokens.exec(this.vfl)) {
          this.chunkVfl(this.referenceTokens);

          constraints.lastConstraint().addView(result[0]);

          return this.constraintWalker(this.TYPES.REFERENCE, constraints);
          
          break;
        }

        // ][ 
        if (result = this.viewTokens.exec(this.vfl)) {
          this.chunkVfl(this.viewTokens);

          // ERROR: [[ or []
          if (!p) {
            console.error('VFL ERROR: Malformed view reference.');
            break;
          }

          if (result[0] === '[') {
            constraints.lastConstraint().lastView().spacing = {
              margin: Constraint.INSTRUCTIONS.MARGINS[constraints.orientation],
              value: 0
            };

            return this.constraintWalker(this.TYPES.VIEW, constraints);
          }
        }

        // ]|
        if (result = this.superviewTokens.exec(this.vfl)) {
          this.chunkVfl(this.superviewTokens);

          constraints.lastConstraint().lastView().spacing = {
            margin: Constraint.INSTRUCTIONS.MARGINS[constraints.orientation],
            value: 0
          };

          constraints.lastConstraint().addView('superView');

          return this.constraintWalker(this.TYPES.SUPERVIEW, constraints);
        }

        // ]-
        if (result = this.connectionTokens.exec(this.vfl)) {
          this.chunkVfl(this.connectionTokens);

          constraints.lastConstraint().lastView().spacing = {
            margin: Constraint.INSTRUCTIONS.MARGINS[constraints.orientation],
            value: Constraint.DEFAULT_SPACING
          };

          return this.constraintWalker(this.TYPES.CONNECTION, constraints);
        }

        break;

        case this.TYPES.REFERENCE:

        // :VIEW:(
        if (result = this.predicateTokens.exec(this.vfl)) {
          this.chunkVfl(this.predicateTokens);

          if (result[0] === '(') {
            this.sizingConstraintWalker(this.TYPES.PREDICATE, constraints.lastConstraint());
          }

          return this.constraintWalker(this.TYPES.PREDICATE, constraints);
          break;
        }

        // :VIEW:]
        if (result = this.viewTokens.exec(this.vfl)) {
          this.chunkVfl(this.viewTokens);

          return this.constraintWalker(this.TYPES.VIEW, constraints);
          break;
        } 

        break;

        case this.TYPES.SUPERVIEW:

        // |-
        if (result = this.connectionTokens.exec(this.vfl)) {
          this.chunkVfl(this.connectionTokens);

          constraints.lastConstraint().lastView().spacing = {
            margin: Constraint.INSTRUCTIONS.MARGINS[constraints.orientation],
            value: Constraint.DEFAULT_SPACING
          };

          return this.constraintWalker(this.TYPES.CONNECTION, constraints);
          break;
        }

        // |[
        if (result = this.viewTokens.exec(this.vfl)) {
          this.chunkVfl(this.viewTokens);

          constraints.lastConstraint().lastView().spacing = {
            margin: Constraint.INSTRUCTIONS.MARGINS[constraints.orientation],
            value: 0
          };

          return this.constraintWalker(this.TYPES.VIEW, constraints);
          break;
        }

        break;

        case this.TYPES.CONNECTION: 

        // -:NUMBER
        if (result = this.numberTokens.exec(this.vfl)) {
          this.chunkVfl(this.numberTokens);

          constraints.lastConstraint().lastView().spacing.value = parseInt(result[0], 10);

          return this.constraintWalker(this.TYPES.NUMBER, constraints);
          break;
        }

        // -[
        if (result = this.viewTokens.exec(this.vfl)) {
          this.chunkVfl(this.viewTokens);

          return this.constraintWalker(this.TYPES.VIEW, constraints);
          break;
        }

        // -|
        if (result = this.superviewTokens.exec(this.vfl)) {
          this.chunkVfl(this.superviewTokens);

          constraints.lastConstraint().addView('parentView');

          return this.constraintWalker(this.TYPES.SUPERVIEW, constraints);
          break;
        }

        break;

        case this.TYPES.NUMBER:

        // :NUMBER:-
        if (result = this.connectionTokens.exec(this.vfl)) {
          this.chunkVfl(this.connectionTokens);

          return this.constraintWalker(this.TYPES.CONNECTION, constraints);
          break;
        }

        break;

        case this.TYPES.PREDICATE:

        if (result = this.viewTokens.exec(this.vfl)) {
          this.chunkVfl(this.viewTokens);
          return this.constraintWalker(this.TYPES.VIEW, constraints);
        }

        default:
        break;
      }
    }
  }
});