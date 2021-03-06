(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(['underscore', 'jquery', 'utils', 'views/helpers', 'views/page', 'models/id_list'], function(_, $, utils, helpers, PageView, id_list) {
    /*
      TODO: docu für pollview
    */

    var PollView;
    return PollView = (function(_super) {

      __extends(PollView, _super);

      function PollView() {
        this.recordAnswer = __bind(this.recordAnswer, this);
        return PollView.__super__.constructor.apply(this, arguments);
      }

      PollView.prototype.template = utils.compileTemplate("poll");

      PollView.prototype.events = {
        "submit form": "recordAnswer"
      };

      PollView.prototype.initialize = function(options) {
        PollView.__super__.initialize.call(this, options);
        return this.listenTo(this.collection, "all", this.render);
      };

      PollView.prototype.render = function() {
        var answer, context, index, _i, _len, _ref, _ref1;
        this.poll = this.collection.firstFresh();
        if (this.poll) {
          _ref = this.poll.get('answers');
          for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
            answer = _ref[index];
            answer.nominal = helpers.nominal(index);
          }
        }
        context = {
          poll: (_ref1 = this.poll) != null ? _ref1.toJSON() : void 0,
          pusher_enabled: cliqr.$App.pusherEnabled()
        };
        this.$el.html(this.template(context));
        return this;
      };

      PollView.prototype.recordAnswer = function(event) {
        var _this = this;
        event.preventDefault();
        if (!id_list.test(this.poll)) {
          return $.post(cliqr.$Polls.url(), this.$("form").serialize()).always(function() {
            return id_list.add(_this.poll);
          }).done(function(msg) {
            return _this.render();
          }).fail(function(jqXHR, textStatus) {});
        } else {
          return alert("TODO poll was answered already");
        }
      };

      return PollView;

    })(PageView);
  });

}).call(this);
