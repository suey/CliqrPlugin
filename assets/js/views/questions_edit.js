(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(['views/template_view', 'views/questions_form'], function(TemplateView, QuestionsForm) {
    var QuestionsEditView;
    return QuestionsEditView = (function(_super) {

      __extends(QuestionsEditView, _super);

      function QuestionsEditView() {
        return QuestionsEditView.__super__.constructor.apply(this, arguments);
      }

      QuestionsEditView.prototype.template_id = 'questions-edit';

      QuestionsEditView.prototype.className = "page";

      QuestionsEditView.prototype.initialize = function() {
        return this.form = new QuestionsForm({
          model: this.model
        });
      };

      QuestionsEditView.prototype.render = function() {
        this.$el.html(this.template());
        this.$el.append(this.form.render().el);
        return this;
      };

      return QuestionsEditView;

    })(TemplateView);
  });

}).call(this);
