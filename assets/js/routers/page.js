(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(['backbone', 'jquery'], function(Backbone, $) {
    /*
      Customized Backbone.Router playing nicely with jqm
    */

    var PageRouter;
    return PageRouter = (function(_super) {

      __extends(PageRouter, _super);

      function PageRouter() {
        return PageRouter.__super__.constructor.apply(this, arguments);
      }

      PageRouter.prototype.initialize = function() {
        return this.firstPage = true;
      };

      /*
          Internal function to be used by the route handlers.
      
          `page` is a Backbone.View which is added as a jQuery mobile page to
          the pageContainer. Eventually, after all the setup mojo and
          everything is in place, the `jQuery mobile way`(TM) of changing
          pages is invoked.
      */


      PageRouter.prototype.changePage = function(page) {
        /*
              add "data-role=page" to the element of the page, then render and insert into the body
        */

        var transition;
        $(page.el).attr('data-role', 'page');
        page.render();
        $('body').append($(page.el));
        /*
              do not use transition for first page
        */

        transition = $.mobile.defaultPageTransition;
        if (this.firstPage) {
          transition = 'none';
          this.firstPage = false;
        }
        /*
              call the jqm function
        */

        return $.mobile.changePage($(page.el), {
          changeHash: false,
          transition: transition
        });
      };

      return PageRouter;

    })(Backbone.Router);
  });

}).call(this);
