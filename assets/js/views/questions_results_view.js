(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(['underscore', 'views/template_view', 'views/helpers'], function(_, TemplateView, helpers) {
    var ResultsView;
    return ResultsView = (function(_super) {

      __extends(ResultsView, _super);

      function ResultsView() {
        return ResultsView.__super__.constructor.apply(this, arguments);
      }

      ResultsView.prototype.template_id = 'questions-results';

      ResultsView.prototype.className = 'results';

      ResultsView.prototype.enhanceChart = function() {
        var counts, data, max, width, widths;
        this.$('.chart').remove();
        width = 300;
        counts = this.$("ol .count");
        data = _.pluck(this.model, "counter");
        max = _.max(data);
        widths = _.map(data, function(d) {
          if (max > 0) {
            return d / max * width;
          } else {
            return 0;
          }
        });
        return counts.before(function(index) {
          return $('<span class="chart"></div>').css({
            width: widths[index]
          }).attr({
            "data-count": data[index]
          });
        });
      };

      ResultsView.prototype.enrichedModel = function() {
        var answer, i, percent, size;
        size = _.reduce(this.model, (function(memo, answer) {
          return memo + answer.counter;
        }), 0);
        return {
          size: size,
          answers: (function() {
            var _i, _len, _ref, _results;
            _ref = this.model;
            _results = [];
            for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
              answer = _ref[i];
              percent = size === 0 ? 0 : Math.floor(100 * answer.counter / size);
              _results.push(_.extend({}, answer, {
                nominal: helpers.nominal(i),
                percent: percent
              }));
            }
            return _results;
          }).call(this)
        };
      };

      ResultsView.prototype.render = function() {
        this.$el.html(this.template(this.enrichedModel()));
        this.enhanceChart();
        return this;
      };

      ResultsView.prototype.update = function(answers) {
        this.model = answers;
        return this.render();
      };

      return ResultsView;

    })(TemplateView);
  });

}).call(this);
