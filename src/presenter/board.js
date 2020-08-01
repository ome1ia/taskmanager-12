import BoardView from "../view/board.js";
import SortView from "../view/sort.js";
import TaskListView from "../view/task-list.js";
import NoTaskView from "../view/no-task.js";
import TaskView from "../view/task.js";
import TaskEditView from "../view/task-edit.js";
import LoadMoreButtonView from "../view/load-more-button.js";
import {render, RenderPosition} from "../utils/render.js";

const TASK_COUNT_PER_STEP = 8;

export default class BoardPresenter {
  constructor(boardTasks) {
    this._boardTasks = boardTasks;
    this._boardComponent = new BoardView();
    this._sortComponent = new SortView();
    this._taskListComponent = new TaskListView();
    this._noTaskComponent = new NoTaskView();
    this._loadMoreButtonComponent = new LoadMoreButtonView();
  }

  _renderTask(taskListElement, task) {
    const taskComponent = new TaskView(task);
    const taskEditComponent = new TaskEditView(task);

    const replaceCardToForm = () => {
      taskListElement.replaceChild(taskEditComponent.getElement(), taskComponent.getElement());
    };

    const replaceFormToCard = () => {
      taskListElement.replaceChild(taskComponent.getElement(), taskEditComponent.getElement());
    };

    const onEscKeyDown = (evt) => {
      if (evt.key === `Escape` || evt.key === `Esc`) {
        evt.preventDefault();
        replaceFormToCard();
        document.removeEventListener(`keydown`, onEscKeyDown);
      }
    };

    taskComponent.setEditClickHandler(() => {
      replaceCardToForm();
      document.addEventListener(`keydown`, onEscKeyDown);
    });

    taskEditComponent.setSubmitHandler((evt) => {
      evt.preventDefault();
      replaceFormToCard();
      document.removeEventListener(`keydown`, onEscKeyDown);
    });

    render(taskListElement, taskComponent, RenderPosition.BEFOREEND);
  }

  render(boardContainer) {
    const boardComponent = new BoardView();
    const taskListComponent = new TaskListView();

    render(boardContainer, boardComponent, RenderPosition.BEFOREEND);
    render(boardComponent, taskListComponent, RenderPosition.BEFOREEND);

    if (this._boardTasks.length === 0 || this._boardTasks.every((task) => task.isArchive)) {
      render(boardComponent, new NoTaskView(), RenderPosition.AFTERBEGIN);
      return;
    }

    render(boardComponent, new SortView(), RenderPosition.AFTERBEGIN);

    this._boardTasks
      .slice(0, Math.min(this._boardTasks.length, TASK_COUNT_PER_STEP))
      .forEach((boardTask) => this._renderTask(taskListComponent.getElement(), boardTask));

    if (this._boardTasks.length > TASK_COUNT_PER_STEP) {
      let renderedTaskCount = TASK_COUNT_PER_STEP;

      const loadMoreButtonComponent = new LoadMoreButtonView();

      render(boardComponent, loadMoreButtonComponent, RenderPosition.BEFOREEND);

      loadMoreButtonComponent.setClickHandler((evt) => {
        evt.preventDefault();
        this._boardTasks
          .slice(renderedTaskCount, renderedTaskCount + TASK_COUNT_PER_STEP)
          .forEach((boardTask) => this._renderTask(taskListComponent.getElement(), boardTask));

        renderedTaskCount += TASK_COUNT_PER_STEP;

        if (renderedTaskCount >= this._boardTasks.length) {
          loadMoreButtonComponent.getElement().remove();
          loadMoreButtonComponent.removeElement();
        }
      });
    }
  }
}
