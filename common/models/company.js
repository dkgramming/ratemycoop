module.exports = function(Company) {
  /**
   * Method to recalculate company attributes when a new review has been posted.
   */
  Company.prototype.recalculate = function() {
    var self = this;

    var overallRating = 0;
    var overallRatingCount = 0;
    var cultureRating = 0;
    var cultureRatingCount = 0;
    var difficultyRating = 0;
    var difficultyRatingCount = 0;

    self.reviews(null, function(err, reviews){
      reviews.forEach(
        function(review) {
          if (review.payTypeId === 2) {
            var yearly = review.pay * 12;
            var weekly = yearly / 52;
            review.pay = weekly / 40;
          }

          if ('overallRating' in review && review.overallRating != 0) {
            overallRating += review.overallRating;
            overallRatingCount++;
          }

          if ('cultureRating' in review && review.cultureRating != 0) {
            cultureRating += review.cultureRating;
            cultureRatingCount++;
          }

          if ('difficultyRating' in review && review.difficultyRating != 0) {
            difficultyRating += review.difficultyRating;
            difficultyRatingCount++;
          }

          if (review.payTypeId != 3) {
            if (review.pay < self.minPay) {
              self.minPay = review.pay;
            }

            if (review.pay > self.maxPay) {
              self.maxPay = review.pay;
            }
          }
        }
      );

      if (overallRatingCount == 0) {
        overallRatingCount = 1;
      }

      if (cultureRatingCount == 0) {
        cultureRatingCount = 1;
      }

      if (difficultyRatingCount == 0) {
        difficultyRatingCount = 1;
      }
    
      self.overallRating = overallRating / overallRatingCount;
      self.cultureRating = cultureRating / cultureRatingCount;
      self.difficultyRating = difficultyRating / difficultyRatingCount;

      self.save();
    });
  };

  /**
  * Method to update company perks, majors, and locations with a new review.
  */
  Company.prototype.updatePML = function(perks, majors, loc) {
    var self = this;
    if(perks.length > 0){
      perks.forEach(function(perk) {
        if(perk !== null){
          self.perks.findById(perk, function(err, exist_perk) {
            if(exist_perk === undefined) {
              self.perks.add(perk, function(err, add_perk) {});
            }
          });
        }
      });
    }
    
    if(majors.length > 0){
      majors.forEach(function(major) {
        if(major !== null){
          self.majors.findById(major, function(err, exist_major) {
            if(exist_major === undefined) {
              self.majors.add(major, function(err, add_major) {});
            }
          });
        }
      });
    }
    
    if(loc !== null && loc !== undefined){
      self.locations.findById(loc, function(err, exist_loc) {
        if(exist_loc === undefined) {
          self.locations.add(loc, function(err, add_loc) {});
        }
      });
    }
  };

  Company.beforeRemote(
    '*.__create__reviews',
    function(ctx, instance, next) {
      var loopback = require('loopback');
      var loopback_context = loopback.getCurrentContext();

      if (loopback_context !== null) {
        var currentUser = loopback_context.get('currentUser');

        ONE_MONTH = 30 * 24 * 60 * 60 * 1000;  // Month in milliseconds
        Company.app.models.Review.findOne(
          {
            where: {
              userId: currentUser.id,
              companyId: instance.companyId,
              created: { 
                gt: Date.now() - (ONE_MONTH * 3)
              }
            }
          },
          function(err, review) {
            if (review) {
              var error = new Error('You\'ve already reviewed this company in the past three months.');
              next(error);
            } else {
              next();
            }
          }
        );
      }
    }
  );

  /**
   * Remote method hook
   */
  Company.afterRemote(
    '*.__create__reviews',
    function(ctx, instance, next) {
      instance.created = new Date();
      Company.findOne(
        {
          where: {
            id: instance.companyId
          },
          include: "reviews"
        },
        function(err, company) {
          if (instance.payTypeId != 3 && company.minPay === 0) {
            company.minPay = instance.pay;
          }

          if (!instance.perks) {
            instance.perks = [];
          }

          if (!instance.majors) {
            instance.majors = [];
          }

          company.recalculate();
          company.updatePML(instance.perks, instance.majors, instance.location);
        }
      );

      next();
    }
  );

  /**
   *
   */
  Company.afterRemote(
    '*.__get__reviews',
    function(ctx, instance, next) {
      if (instance.reviews) {
        var reviews = instance.reviews();
        if (reviews) {
          reviews.forEach(
            function(review) {
              if (review.anonymous) {
                review.userId = null;
              }
            }
          );
        }
      }

      next();
    }
  );
};
