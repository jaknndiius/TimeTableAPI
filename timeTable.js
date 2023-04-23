'use strict'

import { Setting, SelfStudy, ClassName } from './timeTableAPI.js';

const weekName = ['월', '화', '수', '목', '금'];
const toWeekdayPreiod = index => {
  if(index > 0 && index < 6) return index-1;
  return -1;
}
const createElementWithText = (tag, textContent) => {
  const element = document.createElement(tag);
  element.textContent = textContent;
  return element;
}
const EventHandler = {
  onSubjectTdClicked: subjectTd => {
    const teacherTd = subjectTd.parentElement.querySelector('.teacher_name');
    subjectTd.style.display = 'none';
    teacherTd.style.display = 'block';
  },
  onTeacherTdClicked: teacherTd => {
    const subjectTd = teacherTd.parentElement.querySelector('.subject_name');
    teacherTd.style.display = 'none';
    subjectTd.style.display = 'block';
  }
}
const ElementCreator = {
  makeClickableSubject: subjectName => {
    const p = createElementWithText('p', subjectName);
    p.classList.add('subject_name');
    p.onclick = event => EventHandler.onSubjectTdClicked(event.target);
    return p;
  },
  makeClickableTeacher: teacherName => {
    const p = createElementWithText('p', teacherName);
    p.classList.add('teacher_name');
    p.style.display = 'none';
    p.onclick = event => EventHandler.onTeacherTdClicked(event.target);
    return p;
  },
  makeClickableTd: (subjectName, teacherName) => {
    const td = document.createElement('td');
    td.appendChild(ElementCreator.makeClickableSubject(subjectName));
    td.appendChild(ElementCreator.makeClickableTeacher(teacherName));
    return td;
  }
}
class Table {
  constructor(id, caption) {
    this.id = id;
    this.caption = caption;
  }

  makeHead() {}
  makeBody() {}
}
class SimpleTable extends Table {
  constructor(id, caption) {
    if(SimpleTable.instance) throw new Error('alreay instantiated class.');
    super(id, caption);
    SimpleTable.instance = this;
  }
  static getInstance() {
    if(!this.instance) this.instance = new SimpleTable('today_time_table', '오늘의 시간표');
    return this.instance;
  }
  makeHead(currentClass) {
    const thead = document.createElement('thead');
    const tr = document.createElement('tr');
    for(let i=0;i<7;i++) {
      const th = createElementWithText('th', (i+1) + '교시');
      if(i == currentClass-1) th.classList.add('lin-highlight1');
      tr.appendChild(th);
    }
    thead.appendChild(tr);
    return thead;
  }
  makeBody(weekIndex, currentClass) {
    const tbody = document.createElement('tbody');
    const tr = document.createElement('tr');
    const subjectByTime = Setting.getSubjectsByTime();
    subjectByTime.length != 0 && subjectByTime[weekIndex] && subjectByTime[weekIndex].forEach((sub, idx) => {
      const td = ElementCreator.makeClickableTd(sub+'', sub.teacher);
      if(idx == currentClass-1) td.classList.add('lin-highlight1');
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
    return tbody;
  }
  makeHoliday() {
    const div = document.createElement('div');
    div.classList.add('lin-highlight1')
    div.appendChild(createElementWithText('p', '오늘은 신나는 휴일!'));
    return div;
  }
  static reload(weekIndex, currentClass) {
    const instance = SimpleTable.getInstance();
    const table = document.querySelector('#' + instance.id);
    if(weekIndex == -1) table.replaceChildren(instance.makeHoliday())
    else table.replaceChildren(
          createElementWithText('caption', instance.caption),
          instance.makeHead(currentClass),
          instance.makeBody(weekIndex, currentClass));
  }
}
class MainTable extends Table {
  constructor(id, caption) {
    if(MainTable.instance) throw new Error('alreay instantiated class.');
    super(id, caption);
    MainTable.instance = this;
  }
  static getInstance() {
    if(!this.instance) this.instance = new MainTable('time_table', 'Time Table');
    return this.instance;
  }
  makeRow(weekIndex, subjects, highlight) {
    const tr = document.createElement('tr');
    if(highlight) tr.classList.add('lin-highlight2');
    tr.appendChild(
      createElementWithText('th', weekName[weekIndex] + '요일'));
    subjects && subjects.forEach(sub =>
      tr.appendChild(ElementCreator.makeClickableTd(sub+'', sub.teacher)));
    return tr;
  }
  makeHead() {
    const thead = document.createElement('thead');
    const tr = document.createElement('tr');
    tr.appendChild(document.createElement('th'));
    for(let i=0;i<7;i++)
      tr.appendChild(
        createElementWithText('th', (i+1) + '교시'));
    thead.appendChild(tr);
    return thead;
  }
  makeBody(weekIndex) {
    const tbody = document.createElement('tbody');
    for(let i=0;i<5;i++) {
      tbody.appendChild(
        this.makeRow(i, Setting.getSubjectsByTime()[i], weekIndex == i));
    }
    return tbody;
  }
  static reload(weekIndex) {
    const instance = MainTable.getInstance();
    const table = document.querySelector('#' + instance.id);
    table.replaceChildren(
      createElementWithText('caption', instance.caption),
      instance.makeHead(),
      instance.makeBody(weekIndex));
  }
}
class ExamTable extends Table {
  constructor(id, caption) {
    if(ExamTable.instance) throw new Error('alreay instantiated class.');
    super(id, caption);
    ExamTable.instance = this;
  }
  static getInstance() {
    if(!this.instance) this.instance = new ExamTable('exam_time_table', '시험 시간표');
    return this.instance;
  }
  koreanDay = ['첫째날', '둘째날', '셋째날', '넷째날'];
  makeModalWindow(subject) {
    const attribute = subject.examAttribute;
    const popupDiv = document.createElement('div');
    popupDiv.id = 'popup';

    const textDiv = document.createElement('div');
    textDiv.classList.add('text');

    const header = document.createElement('header');
    header.appendChild(createElementWithText('div', subject));
    const button = document.createElement('button');
    button.appendChild(document.createElement('div'));
    button.appendChild(document.createElement('div'));
    button.onclick = () => popupDiv.remove();
    header.appendChild(button);
    textDiv.appendChild(header);

    const main = document.createElement('main');
    const rangeUl = document.createElement('ul');
    rangeUl.id = 'range';
    if(attribute == undefined) {
      rangeUl.append(createElementWithText('li', '시험 정보가 업데이트 되지 않았습니다.'));
      rangeUl.append(createElementWithText('li', '시험 정보를 제공해 주세요 :)'));
      rangeUl.append(createElementWithText('li', '시험 정보가 제공되면 객관식 밑 서술형 문항 갯수와 시험 범위를 확인하실 수 있습니다.'));
    }
    else
      for(const range of attribute.ranges)
        rangeUl.appendChild(
          createElementWithText('li', range));
    main.appendChild(rangeUl);
    const questionsNumberUl = document.createElement('ul');
    questionsNumberUl.id = 'questions_number';
    if(attribute) {
      attribute.selective > 0 &&
      questionsNumberUl.appendChild(
        createElementWithText('li', `객관식 ${attribute.selective}개`));
    attribute.descriptive > 0 &&
      questionsNumberUl.appendChild(
        createElementWithText('li', `서술형 ${attribute.descriptive}개`));
    }
    main.appendChild(questionsNumberUl);
    textDiv.appendChild(main);

    popupDiv.appendChild(textDiv);
    return popupDiv;
  }
  onExamTdClicked(subject) {
    document.querySelector('#main').appendChild(
      this.makeModalWindow(subject));
  }
  formatDate(day) {
    return `${day.getMonth()+1}/${day.getDate()} ${weekName[day.getDay()-1] || ''}`;
  }
  makeHead() {
    const thead = document.createElement('thead');

    const koreanDayTr = document.createElement('tr');
    koreanDayTr.appendChild(document.createElement('th'));
    const numberDayTr = document.createElement('tr');
    numberDayTr.appendChild(document.createElement('th'));
  
    Setting.getExamList().forEach(({day}, index) => {
      koreanDayTr.appendChild(
        createElementWithText('th', this.koreanDay[index]));
      numberDayTr.appendChild(
        createElementWithText('th', `${this.formatDate(day)}`));
    });

    thead.appendChild(koreanDayTr);
    thead.appendChild(numberDayTr);
    return thead;
  }
  makeBody() {
    if(Setting.getExamList().length == 0) return null;
    const tbody = document.createElement('tbody');
    const maxSize = Math.max(...Setting.getExamList().map(exams => exams.subjects.length));
    const examsByTime = new Array(maxSize).fill().map(_ => []);
    Setting.getExamList().forEach(exams => examsByTime.forEach((arr, idx) => arr.push(exams.subjects[idx])));
    examsByTime.forEach((exams, index) => {
      const tr = document.createElement('tr');
      tr.appendChild(createElementWithText('th', (index+1) + '교시'));
      for(const subject of exams) {
        let td;
        if(subject == undefined) td = createElementWithText('td', '-');
        else if (subject == SelfStudy) {
          td = createElementWithText('td', '자습');
        }
        else {
          td = createElementWithText('td', subject);
          td.onclick = () => this.onExamTdClicked(subject);
        }
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    });
    return tbody;
  }
  static reload() {
    const instance = ExamTable.getInstance();
    const table = document.querySelector('#' + instance.id);

    const body = instance.makeBody();
    if(body != null)
      table.replaceChildren(
        createElementWithText('caption', instance.caption),
        instance.makeHead(),
        body);
  }
}
class MoakTestNoti {
  constructor() {
    if(MoakTestNoti.instance) throw new Error('alreay instantiated class.');
    MoakTestNoti.instance = this;
  }
  static getInstance() {
    if(!this.instance) this.instance = new MoakTestNoti();
    return this.instance;
  }
  options = { month: 'long', day: 'numeric'}
  getDDay(targetDate) {
    const today = new Date();
    const timeDiff = targetDate.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000*60*60*24));
  }
  getFastestDDay() {
    for(const mockTest of Setting.getMoakTests()) {
      const dDay = this.getDDay(mockTest);
      if(dDay >= 0) return {
        date: mockTest.toLocaleDateString('ko-KR', this.options),
        dDay: dDay
      };
    }
    return null;
  }
  makeAllMoaksWindow() {
    const popupDiv = document.createElement('div');
    popupDiv.id = 'popup';

    const textDiv = document.createElement('div');
    textDiv.classList.add('text');

    const header = document.createElement('header');
    header.appendChild(createElementWithText('div', '모의고사'));
    const button = document.createElement('button');
    button.appendChild(document.createElement('div'));
    button.appendChild(document.createElement('div'));
    button.onclick = () => popupDiv.remove();
    header.appendChild(button);
    textDiv.appendChild(header);

    const main = document.createElement('main');
    const moakListUl = document.createElement('ul');
    moakListUl.id = 'range';
    for(const time of Setting.getMoakTests())
      moakListUl.appendChild(
        createElementWithText('li', `${time.toLocaleDateString('ko-KR', this.options)}: D-day ${this.getDDay(time)}일`));
    main.appendChild(moakListUl);
    textDiv.appendChild(main);

    popupDiv.appendChild(textDiv);
    return popupDiv;
  }
  static reload() {
    if((Setting.getMoakTests().length == 0)) return;
    const dDay = MoakTestNoti.getInstance().getFastestDDay();

    const mockTestNotiDiv = document.querySelector('#moak_test_noti');
    mockTestNotiDiv.addEventListener('click',
      () =>
        document.querySelector('#main').appendChild(
          MoakTestNoti.getInstance().makeAllMoaksWindow()));
    if(dDay == null && Setting.getMoakTests().length != 0) {
      const titleDiv = createElementWithText('div', `[모의고사 모두보기 ▾]`);
      mockTestNotiDiv.replaceChildren(titleDiv);
      return;
    }
    const titleDiv = createElementWithText('div', `모의고사 ${dDay.date}`);
    const dDayDiv = createElementWithText('div', `D-day ${dDay.dDay}일`);
    mockTestNotiDiv.replaceChildren(titleDiv, dDayDiv);

  }
}
const getElapsedTime = (fromHour, fromMinute, toHour, toMinute) => ((toHour-fromHour)*60) + toMinute-fromMinute;
const getDuration = (previousTime, currentTime) => (currentTime[0] -previousTime[0])*60 +currentTime[1] -previousTime[1];
const checkUndefinedInClassTime = () => {
  for(const time of Setting.getClassTimes())
    if(time == undefined) return false;
  return true;
};
const getEmptyElement = () => {
  return Object.keys(ClassName)[Setting.getClassTimes().findIndex(v => !v)];
}
const getClassTimes = () => {
  if(!checkUndefinedInClassTime()) throw new Error(`${getEmptyElement()} in Setting.ClassTimes is not set. Set through Setting.setClassTime method.`);
  const copiedArray = [];
  Setting.getClassTimes().forEach(time => copiedArray.push([...time]));
  return copiedArray;
};
const getTimeAndDuration = () => {
  const classTimes = getClassTimes();
  for(const [idx, time] of Object.entries(classTimes)) {
    if(idx != 0) {
      const dur = getDuration(classTimes[idx-1], time);
      if(dur <= 0) throw new Error('Invalid class time order. Class times should be in chronological order.');
      classTimes[idx-1].push(dur);
    }
  }
  return classTimes.slice(0, classTimes.length-1);
}
const getClassIndex = (hour, minute) => {
  let returnIndex = -1;
  getTimeAndDuration().forEach(([startHour, startMinutes, duration], index) => {
    const pre = getElapsedTime(startHour, startMinutes, hour, minute);
    if(pre >=0 && pre < duration) returnIndex = index+1;
  });
  return returnIndex;
}
const Previouis = { currentClass: -100, weekIndex: -100 };
const updateMainScreen = (weekIndex, currentClass) => {
  if(currentClass != Previouis.currentClass) {
    if(currentClass > 0)
      document.querySelector('#text_time').textContent = `>> ${currentClass}교시 <<`;
    SimpleTable.reload(weekIndex, currentClass);
    Previouis.currentClass = currentClass;
  }
  if(weekIndex != Previouis.weekIndex) {
    MainTable.reload(weekIndex);
    Previouis.weekIndex = weekIndex;
  }
}
const getDate = () => {
  const date = new Date();
  return {
    day: date.getDay(),
    hours: date.getHours(),
    minutes: date.getMinutes(),
    seconds: date.getSeconds()
  };
}
const render = () => {
  const time = getDate();
  const weekIndex = toWeekdayPreiod(time.day);
  const currentClass = getClassIndex(time.hours, time.minutes);
  updateMainScreen(weekIndex, currentClass);
  updateSchoolTimeBar(time);
}
const schoolTime = { hours: 16, minutes: 0, seconds: 0 }
const updateSchoolTimeBar = ({hours, minutes, seconds}) => {
  const fix = number => number.toFixed(1);
  const footer = document.getElementById('footer');
  const sumTime = (function() {
    const untilHours = schoolTime.hours - hours;
    const untilMinutes = schoolTime.minutes - minutes;
    const untilSeconds = schoolTime.seconds - seconds;
    return untilHours*3600 + untilMinutes*60 + untilSeconds;
  })();
  if (sumTime >= 0) footer.innerHTML = `하교까지 약 <span>${fix(sumTime/3600)}</span>시간 = <span>${fix(sumTime/60)}</span>분 = <span>${sumTime}</span>초 남았다!`
}
const getBaseDocument = () => {
  return `
<header>
  <p id="title" class="lin">&lt Time Table &gt</p>
</header>
<main id="main">
  <p id="text_time" class="lin"></p>
  <table id="today_time_table"></table>
  <table id="time_table"></table>
  <table id="exam_time_table"></table>
  <div id="moak_test_noti"></div>
</main>
<footer><p id="footer"></p></footer>`;
}
// load page
export const load = () => {
  document.body.innerHTML = getBaseDocument();
  ExamTable.reload();
  MoakTestNoti.reload();
  setInterval(render, 1);
}