<?php
global $sess;
require_once "lib/vote/vote.config.php";
require_once "lib/vote/Vote.class.php";

require_once 'cliqr_controller.php';

use \Cliqr\Question;

class QuestionsController extends CliqrStudipController
{
    public function before_filter(&$action, &$args)
    {
        parent::before_filter($action, $args);


        # needs context
        $this->cid = Request::get("cid");
        if (!isset($this->cid)) {
            throw new Trails_Exception(400);
        }

        # authorisation
        if (!$GLOBALS['perm']->have_studip_perm("tutor", $this->cid)) {
            throw new Trails_Exception(403);
        }


        $this->flash = Trails_Flash::instance();

        if (!Request::isXhr()) {
            # set default layout
            $this->set_layout('layout');

            # set title
            $GLOBALS['CURRENT_PAGE'] = 'Cliqr';
            PageLayout::setTitle(_('Cliqr'));

            if ($action === 'new') {
                Navigation::activateItem("/course/cliqr/new");
            } else {
                Navigation::activateItem("/course/cliqr/index");
            }
        }

        // TODO: anders sicherstellen, dass sich #state und #start/stopdate nicht widersprechen
        Question::consolidateState($this->cid);

        # set question
        if (in_array($action, words("show edit update destroy start stop"))) {
            self::ensureMD5($args[0]);
            $this->question = Question::find($args[0]);
        }
    }

    /***************************************************************************/
    /* ACTIONS                                                                 */
    /***************************************************************************/

    function index_action() {
        $this->questions = Question::findAll($this->cid);

        if (Request::isXhr()) {
            $this->render_json(array_map(function ($q) { return $q->toJSON(); },
                                         $this->questions));
        }
    }

    function show_action($id)
    {
        if (Request::isXhr()) {
            $this->render_json($this->question->toJSON());
        } else {
            $this->shortener = $this->plugin->config['shortener'];
        }
    }

    function create_action()
    {
        $params = $this->getQuestionParams();
        $question = $this->createNewQuestion($params);

        $question->executeWrite();
        $error = $question->isError();

        if ($error) {
            throw new Trails_Exception(500, "Could not create".json_encode($question));
        } else {
            $this->response->set_status(201, "Created");
            return $this->render_json($question->toJSON());
        }
    }

    // TODO: mit create_action kombinieren?
    // TODO: Validation!? (eingebaut?)
    function update_action($id)
    {
        $params = $this->getQuestionParams();
        $error = $this->updateQuestion($this->question, $params);

        if ($error) {
            throw new Trails_Exception(500, "Could not update".json_encode($this->question->errorArray));
        } else {
            $this->response->set_status(201, "Updated");
            return $this->render_json($this->question->toJSON());
        }
    }

    function destroy_action($id)
    {
        $this->question->executeRemove();
        $error = $this->question->isError();

        if (Request::isXhr()) {
            if ($error) {
                throw new Trails_Exception(500, "Could not delete");
            } else {
                $this->response->set_status(204);
                return $this->render_nothing();
            }
        }
        else {
            if ($error) {
                $this->flash['error'] = "Could not delete question. Already deleted?";
            } else {
                $this->flash['info'] = "Question deleted";
            }
            return $this->redirect('questions/index');
        }
    }

    # TODO not restful
    function start_action($id)
    {

        CSRFProtection::verifyUnsafeRequest();

        $ok = $this->question->start(true);

        if (Request::isXhr()) {
            if ($ok) {
                $this->response->set_status(204);
                return $this->render_nothing();
            } else {
                throw new Trails_Exception(400, "Could not start");
            }
        }
        else {
            if ($ok) {
                $this->flash['info'] = "Question started";
            } else {
                $this->flash['error'] = "Could not start question. Already started?";
            }
            return $this->redirect('questions/show/' . $id);
        }
    }


    # TODO not restful
    function stop_action($id)
    {
        CSRFProtection::verifyUnsafeRequest();

        $ok = $this->question->stop();

        if (Request::isXhr()) {
            if ($ok) {
                $this->response->set_status(204);
                return $this->render_nothing();
            } else {
                throw new Trails_Exception(400, "Could not stop");
            }
        }
        else {
            if ($ok) {
                $this->flash['info'] = "Question stopped";
            } else {
                $this->flash['error'] = "Could not stop question. Already stopped?";
            }
            return $this->redirect('questions/show/' . $id);
        }
    }



    private function getQuestionParams()
    {
        if ($this->hasJSONContentType()) {
            $params = $this->parseJSONBody();
        }
        else {
            $params = self::utf8decode(
                array(
                    'question' => Request::get('question')
                  , 'choices'  => Request::getArray('choices')
                ));
        }

        return $params;
    }


    private function createNewQuestion($params)
    {
        global $auth;

        // TODO: Validation!? (eingebaut?)
        $question = new Question();
        $question->setAuthorID($auth->auth["uid"]);

        // TODO: das ist so nicht sauber, das müsste Question machen
        $question->setRangeID(Question::transformRangeId($this->cid));

        $question->setQuestion($q = $params['question']);
        $question->setTitle(my_substr($q, 0, 50));

        $choices = Question::makeChoices($params['choices']);
        $question->setAnswers($choices);

        return $question;
    }

    private function updateQuestion($question, $params)
    {
        $dirty = false;

        // UPDATE QUESTION
        if (isset($params['question'])) {
            $question->setQuestion($q = $params['question']);
            $question->setTitle(my_substr($q, 0, 50));
            $dirty = true;
        }

        // UPDATE CHOICES
        // TODO zuviel in dieser action, besser nur 10 zeilen pro function
        if (isset($params['choices'])) {

            $answers = array();
            foreach ($question->getAnswers() as $answer) {
                $answers[$answer['answer_id']] = $answer;
            }
            $new_answers = array();
            foreach ($params['choices'] as $id => $choice) {
                if ($choice !== '') {
                    $new_answers[] = is_int($id)
                      ? Question::makeChoice($choice)
                      : array_merge($answers[$id], array('text' => $choice));
                }
            }
            $question->setAnswers($new_answers);
            $dirty = true;
        }

        if ($dirty) {
            $question->executeWrite();
        }
        return $question->isError();
    }
}
