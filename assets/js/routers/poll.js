(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(['backbone', 'routers/page', 'views/poll'], function(Backbone, PageRouter, PollView) {
    /*
      The singleton AppRouter containing the handlers for all the routes.
    */

    var PollRouter;
    return PollRouter = (function(_super) {

      __extends(PollRouter, _super);

      function PollRouter() {
        return PollRouter.__super__.constructor.apply(this, arguments);
      }

      PollRouter.prototype.routes = {
        "": "showPoll"
      };

      PollRouter.prototype.showPoll = function() {
        return this.changePage(new PollView({
          collection: cliqr.$Polls
        }));
      };

      PollRouter.prototype.pusherEnabled = function() {
        return cliqr.config.PUSHER_APP_KEY != null;
      };

      return PollRouter;

    })(PageRouter);
  });

}).call(this);
