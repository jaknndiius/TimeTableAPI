'use strict'
import { Setting, SelfStudy } from './timeTableAPI.js';
Array.prototype.removeEmpty = function() { 
  const relis = [];
  this.forEach(ele => relis.push(ele));
  return relis
}
const weekName = ['월', '화', '수', '목', '금'];
const EventHandler = {
  onSubjectTdClicked: subjectTd => {
    subjectTd.style.display = 'none';
    subjectTd.parentElement.querySelector('.teacher_name').style.display = 'block';
  },
  onTeacherTdClicked: teacherTd => {
    teacherTd.style.display = 'none';
    teacherTd.parentElement.querySelector('.subject_name').style.display = 'block';
  }
}
const $createElementWithText = (tag, textContent) => {
  const element = document.createElement(tag);
  element.textContent = textContent;
  return element;
}
const $makeClickableSubject = subjectName => {
  const p = $createElementWithText('p', subjectName);
  p.classList.add('subject_name');
  p.onclick = event => EventHandler.onSubjectTdClicked(event.target);
  return p;
}
const $makeClickableTeacher = teacherName => {
  const p = $createElementWithText('p', teacherName);
  p.classList.add('teacher_name');
  p.style.display = 'none';
  p.onclick = event => EventHandler.onTeacherTdClicked(event.target);
  return p;
}
const $makeClickableTd = (subjectName, teacherName) => {
  const td = document.createElement('td');
  td.appendChild($makeClickableSubject(subjectName));
  td.appendChild($makeClickableTeacher(teacherName));
  return td;
}
const $makeModalWindow = (title, paragraphs, footer) => {
  const popupDiv = document.createElement('div');
  popupDiv.id = 'popup';

  const textDiv = document.createElement('div');
  textDiv.classList.add('text');

  const header = document.createElement('header');
  header.appendChild($createElementWithText('div', title));
  const button = document.createElement('button');
  button.appendChild(document.createElement('div'));
  button.appendChild(document.createElement('div'));
  button.onclick = () => popupDiv.remove();
  header.appendChild(button);
  textDiv.appendChild(header);

  const main = document.createElement('main');
  const paragraphUl = document.createElement('ul');
  paragraphUl.classList.add('paragraph');
  paragraphs.forEach(p =>
    paragraphUl.appendChild(
      $createElementWithText('li', p)));
  main.appendChild(paragraphUl);

  if(footer) {
    const footerUl = document.createElement('ul');
    footerUl.classList.add('footer');
    footer.forEach(f => footerUl.appendChild(
      $createElementWithText('li', f)));
    main.appendChild(footerUl);
  }
  textDiv.appendChild(main);
  popupDiv.appendChild(textDiv);
  return popupDiv;
}
const $popup = modal => {
  document.querySelector('#main').appendChild(modal);
}
class Table {
  constructor(id, caption) {
    this.id = id;
    this.caption = caption;
  }
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
  getClassNumber(weekIndex) {
    return Setting.getSubjectsByTime()[weekIndex]
      ? Setting.getSubjectsByTime()[weekIndex].length
      : [];
  }
  makeHead(weekIndex, currentClass) {
    const thead = document.createElement('thead');
    const tr = document.createElement('tr');
    for(let i = 1; i <= this.getClassNumber(weekIndex); i++) {
      const th = $createElementWithText('th', i + '교시');
      i == currentClass && th.classList.add('lin-highlight1');
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
      const td = $makeClickableTd(sub+'', sub.teacher);
      if(idx == currentClass-1) td.classList.add('lin-highlight1');
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
    return tbody;
  }
  makeHoliday() {
    const div = document.createElement('div');
    div.classList.add('lin-highlight1')
    div.appendChild($createElementWithText('p', '오늘은 신나는 휴일!'));
    return div;
  }
  static reload(weekIndex, currentClass) {
    const instance = SimpleTable.getInstance();
    const table = document.querySelector('#' + instance.id);
    if(weekIndex == -1) table.replaceChildren(instance.makeHoliday())
    else table.replaceChildren(
          $createElementWithText('caption', instance.caption),
          instance.makeHead(weekIndex, currentClass),
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
  getMaxClassNumber() {
    return Math.max(...Setting.getSubjectsByTime().removeEmpty().map(s => s.length));
  }
  makeRow(weekIndex, subjects, highlight) {
    const tr = document.createElement('tr');
    if(highlight) tr.classList.add('lin-highlight2');
    tr.appendChild(
      $createElementWithText('th', weekName[weekIndex] + '요일'));
    if(subjects) {
      for(let i=0;i<this.getMaxClassNumber();i++) {
        const subject = subjects[i];
        tr.appendChild(
          subject
          ? $makeClickableTd(subject+'', subject.teacher)
          : tr.appendChild($createElementWithText('td', '-')));
      }
    }
    return tr;
  }
  makeHead() {
    const thead = document.createElement('thead');
    const tr = document.createElement('tr');
    tr.appendChild(document.createElement('th'));
    for(let i=1;i<=this.getMaxClassNumber();i++)
      tr.appendChild(
        $createElementWithText('th', i + '교시'));
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
      $createElementWithText('caption', instance.caption),
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
  nonExamInfoList = ['시험 정보가 업데이트 되지 않았습니다.', '시험 정보를 제공해 주세요 :)', '시험 정보가 제공되면 객관식 밑 서술형 문항 갯수와 시험 범위를 확인하실 수 있습니다.'];
  makeModalWindow(subject) {
    const attribute = subject.examAttribute;
    const paragraphs =
      attribute
      ? attribute.ranges
      : this.nonExamInfoList;
    const footer =
      attribute
      ?  [`객관식 ${attribute.selective}개`, `서술형 ${attribute.descriptive}개`]
      : null;
    return $makeModalWindow(subject, paragraphs, footer);
  }
  onExamTdClicked(subject) {
    $popup(this.makeModalWindow(subject));
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
        $createElementWithText('th', this.koreanDay[index]));
      numberDayTr.appendChild(
        $createElementWithText('th', `${this.formatDate(day)}`));
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
      tr.appendChild($createElementWithText('th', (index+1) + '교시'));
      for(const subject of exams) {
        let td;
        if(subject == undefined) td = $createElementWithText('td', '-');
        else if (subject == SelfStudy) {
          td = $createElementWithText('td', '자습');
        }
        else {
          td = $createElementWithText('td', subject);
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
        $createElementWithText('caption', instance.caption),
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
  toLocale(date) {
    return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric'});
  } 
  getDDay(targetDate) {
    const today = new Date();
    const timeDiff = targetDate.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000*60*60*24));
  }
  getFastestDDay() {
    for(const mockTest of Setting.getMoakTests()) {
      const dDay = this.getDDay(mockTest);
      if(dDay >= 0) return {
        date: this.toLocale(mockTest),
        dDay: dDay
      };
    }
    return null;
  }
  formetTimeAndDDay(time) {
    return `${this.toLocale(time)}: D-day ${this.getDDay(time)}일`;
  }
  getTestList() {
    const testList = Setting.getMoakTests().map(time => this.formetTimeAndDDay(time));
    Setting.getCSAT() && testList.push(`수능: ${this.formetTimeAndDDay(Setting.getCSAT())}`);
    return testList;
  }
  makeAllMoaksWindow() {
    return $makeModalWindow(
      (Setting.getMoakTests().length == 0)
      ? '수능'
      : (Setting.getCSAT())
        ? '모의고사 및 수능'
        :'모의고사',
      this.getTestList()
    );
  }
  getText() {
    if(this.getTestList().length == 0) return;
    let title, subtitle;
    const dDay = this.getFastestDDay();
    if(dDay == null) {
      if(Setting.getMoakTests().length != 0) {
        title = Setting.getCSAT() ? '[모의고사 및 수능 모두보기 ▾]' : '[모의고사 모두보기 ▾]';
      } else {
        title = `수능 ${this.toLocale(Setting.getCSAT())}`
        subtitle = `D-day ${this.getDDay(Setting.getCSAT())}일`
      }
    } else {
      title = `모의고사 ${dDay.date}`;
      subtitle = `D-day ${dDay.dDay}일`;
    }
    return { title, subtitle };
  }
  static reload() {
    const instance = MoakTestNoti.getInstance();
    if((instance.getTestList().length == 0)) return;
    
    const mockTestNotiDiv = document.querySelector('#moak_test_noti');
    mockTestNotiDiv.addEventListener('click',
      () => $popup(
        instance.makeAllMoaksWindow()));
    const text = instance.getText();
    mockTestNotiDiv.replaceChildren($createElementWithText('div', text.title));
    text.subtitle && mockTestNotiDiv.appendChild($createElementWithText('div', text.subtitle));
  }
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
const toWeekdayPreiod = index => {
  if(index > 0 && index < 6) return index-1;
  return -1;
}
const render = () => {
  const time = getDate();
  const weekIndex = toWeekdayPreiod(time.day);
  const currentClass = Setting.getClassTime().getCurrentClass(time);
  updateMainScreen(weekIndex, currentClass);
  if(time.day != 0 && time.day != 6) updateSchoolTimeBar(time);
}
const getSchoolTime = () => {
  const classTime = Setting.getClassTime().get();
  const schoolTime = classTime[classTime.length -1];
  return {
    hours: schoolTime[0],
    minutes: schoolTime[1],
    seconds: 0
  }
}
const getTimeUntilSchoolTime = ({hours, minutes, seconds}) => {
  const schoolTime = getSchoolTime()
  const untilHours = schoolTime.hours - hours;
  const untilMinutes = schoolTime.minutes - minutes;
  const untilSeconds = schoolTime.seconds - seconds;
  return untilHours*3600 + untilMinutes*60 + untilSeconds;
}
const isSchoolTime = (time) => {
  return getTimeUntilSchoolTime(time) >= 0;
}
const fix = number => number.toFixed(1);
const getTimeBarText = (time) => {
  const sumTime = getTimeUntilSchoolTime(time);
  return `하교까지 약 <span>${fix(sumTime/3600)}</span>시간 = <span>${fix(sumTime/60)}</span>분 = <span>${sumTime}</span>초 남았다!`;
}
const updateSchoolTimeBar = (time) => {
  const footer = document.getElementById('footer');
  if (isSchoolTime(time)) footer.innerHTML = getTimeBarText(time);
}
const getBaseDocument = () => {
  return `<header><p id="title" class="lin">&lt Time Table &gt</p></header><main id="main"><p id="text_time" class="lin"></p><table id="today_time_table"></table><table id="time_table"></table><table id="exam_time_table"></table><div id="moak_test_noti"></div></main><footer><p id="footer"></p></footer>`;
}
// load page
export const load = () => {
  document.body.innerHTML = getBaseDocument();
  ExamTable.reload();
  MoakTestNoti.reload();
  setInterval(render, 1);
}