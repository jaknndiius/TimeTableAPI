import { SelfStudy, Setting, Subject } from './timeTableAPI.js';
const $removeEmpty = function (list: any[]): any[] {
  const relist: any[] = [];
  list.forEach(ele => relist.push(ele));
  return relist;
}
const weekName = ['월', '화', '수', '목', '금'];
const EventHandler = {
  onSubjectTdClicked: (subjectTd: EventTarget | null) => {
    if (subjectTd == null) return;
    const td = subjectTd as HTMLElement;
    td?.style.setProperty('display', 'none');
    (td?.parentElement?.querySelector('.teacher_name') as HTMLElement)?.style.setProperty('display', 'block');
  },
  onTeacherTdClicked: (teacherTd: EventTarget | null) => {
    if (teacherTd == null) return;
    const td = teacherTd as HTMLElement;
    td?.style.setProperty('display', 'none');
    (td?.parentElement?.querySelector('.subject_name') as HTMLElement)?.style.setProperty('display', 'block');
  }
}
const $createElementWithText = (tag: string, textContent: string): HTMLElement => {
  const element = document.createElement(tag);
  element.textContent = textContent;
  return element;
}
const $makeClickableSubject = (subjectName: string): HTMLElement => {
  const p = $createElementWithText('p', subjectName);
  p.classList.add('subject_name');
  p.onclick = event => EventHandler.onSubjectTdClicked(event.target);
  return p;
}
const $makeClickableTeacher = (teacherName: string): HTMLElement => {
  const p = $createElementWithText('p', teacherName);
  p.classList.add('teacher_name');
  p.style.display = 'none';
  p.onclick = event => EventHandler.onTeacherTdClicked(event.target);
  return p;
}
const $setToClickableTd = (td: HTMLTableCellElement, subjectName: string, teacherName: string) => {
  td.appendChild($makeClickableSubject(subjectName));
  td.appendChild($makeClickableTeacher(teacherName));
}
const $makeModalWindow = (title: string, paragraphs: string[], footer: string[] | null = null): HTMLElement => {
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

  if (footer) {
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
const $popup = (modal: HTMLElement) => {
  document.querySelector('#main')?.appendChild(modal);
}
const $makeTable = () => {

}
declare global {
  interface Object {
    let(func: (thisArg: any) => void): any;
  }
}
Object.prototype.let = function (func: (thisArg: any) => void) {
  func(this); return this;
}
type cellGenerator = (cell: HTMLTableCellElement) => void;
class Table {
  public readonly id: string;
  public readonly caption: string;
  constructor(id: string, caption: string) {
    this.id = id;
    this.caption = caption;
  }

  private createRow(): HTMLTableCellElement {
    return document.createElement('td') as HTMLTableCellElement;
  }
  private makeSingleTHead(tHead: HTMLTableSectionElement, titles: cellGenerator[]) {
    const row = tHead.insertRow();
    titles.forEach(
      generator => generator(row.insertCell())
    );
  }
  private makeSeveralTHead(tHead: HTMLTableSectionElement, titleses: cellGenerator[][]) {
    titleses.forEach(
      generators => {
        tHead.insertRow().let(
          (row: HTMLTableRowElement) => {
            generators.forEach(
              generator => generator(row.insertCell())
            );
          }
        )
      }
    );
  }

  public make(titles: cellGenerator[] | cellGenerator[][], bodies: cellGenerator[][]): HTMLTableElement {
    const table = document.createElement('table').let((table: HTMLTableElement) => {
      table.id = this.id;
      table.createCaption().textContent = this.caption;

      const tHead = table.createTHead();
      if (titles[0] instanceof Array)
        this.makeSeveralTHead(tHead, titles as cellGenerator[][]);
      else
        this.makeSingleTHead(tHead, titles as cellGenerator[]);

      table.createTBody().let((tBody: HTMLTableSectionElement) => {
        bodies.forEach(bodyGenerators => {
          tBody.insertRow().let((row: HTMLTableRowElement) => {
            bodyGenerators.forEach(bodyGenerator => {
              bodyGenerator(row.insertCell());
            });
          });
        });
      });
    });
    return table;
  }
}
class SimpleTable extends Table {

  private static instance: SimpleTable;

  private constructor() { super('today_time_table', '오늘의 시간표'); }

  private static getInstance(): SimpleTable {
    if (!SimpleTable.instance) SimpleTable.instance = new SimpleTable();
    return SimpleTable.instance;
  }
  private getClassLength(weekIndex: number): number {
    return Setting.getSubjectsByTime()[weekIndex]
      ? Setting.getSubjectsByTime()[weekIndex].length
      : 0;
  }
  private makeHead(weekIndex: number, currentClass: number): cellGenerator[] {
    const gens: cellGenerator[] = [];
    for (let i = 1; i <= this.getClassLength(weekIndex); i++) {
      gens.push(
        cell => {
          cell.textContent = i + '교시';
          i == currentClass && cell.classList.add('lin-highlight1');
        }
      )
    }
    return gens;
  }
  private makeBody(weekIndex: number, currentClass: number): cellGenerator[][] {
    const subjectByTime = Setting.getSubjectsByTime();

    const genses: cellGenerator[] = [];
    subjectByTime.length != 0 && subjectByTime[weekIndex] && subjectByTime[weekIndex].forEach((sub, idx) => {
      genses.push(
        cell => {
          $setToClickableTd(cell, sub + '', sub.teacher);
          idx == currentClass - 1 && cell.classList.add('lin-highlight1');
        }
      );
    });
    return [genses];
  }
  private makeHoliday(): HTMLElement {
    return document.createElement('div').let((div: HTMLDivElement) => {
      div.classList.add('lin-highlight1');
      div.appendChild($createElementWithText('p', '오늘은 신나는 휴일!'));
    });
  }
  public static reload(weekIndex: number, currentClass: number) {
    const instance = SimpleTable.getInstance();
    const table = document.querySelector('#' + instance.id);
    if (weekIndex == -1) table?.replaceChildren(instance.makeHoliday());
    else table?.replaceWith(
      instance.make(
        instance.makeHead(weekIndex, currentClass),
        instance.makeBody(weekIndex, currentClass)));
  }
}
class MainTable extends Table {
  private static instance: MainTable;

  private constructor() { super('time_table', 'Time Table'); }

  private static getInstance(): MainTable {
    if (!MainTable.instance) MainTable.instance = new MainTable();
    return MainTable.instance;
  }

  private getMaxClassLength(): number {
    return Math.max(...$removeEmpty(Setting.getSubjectsByTime()).map(s => s.length));
  }
  private makeRow(weekIndex: number, subjects: Subject[], highlight: boolean): cellGenerator[] {
    const gens: cellGenerator[] = [];
    gens.push(
      cell => {
        cell.textContent = weekName[weekIndex] + '요일';
        highlight && cell.classList.add('lin-highlight2');
      });
    if (subjects) {
      for (let i = 0; i < this.getMaxClassLength(); i++) {
        const subject = subjects[i];
        gens.push(
          cell => {
            subject
              ? $setToClickableTd(cell, subject + '', subject.teacher)
              : cell.textContent = '-';
            highlight && cell.classList.add('lin-highlight2');
          }
        )
      }
    }
    return gens;
  }
  private makeHead(): cellGenerator[] {
    const gens: cellGenerator[] = [() => { }];
    for (let i = 1; i <= this.getMaxClassLength(); i++)
      gens.push(
        cell => {
          cell.textContent = i + '교시';
        });
    return gens;
  }
  private makeBody(weekIndex: number): cellGenerator[][] {
    const genses: cellGenerator[][] = [];
    for (let i = 0; i < 5; i++) {
      genses.push(
        this.makeRow(i, Setting.getSubjectsByTime()[i], weekIndex == i)
      );
    }
    return genses;
  }
  public static reload(weekIndex: number) {
    const instance = MainTable.getInstance();
    const table = document.querySelector('#' + instance.id);
    table?.replaceWith(
      instance.make(
        instance.makeHead(),
        instance.makeBody(weekIndex)));
  }
}
class ExamTable extends Table {
  private static instance: ExamTable;

  private constructor() { super('exam_time_table', '시험 시간표'); }

  private static getInstance(): ExamTable {
    if (!ExamTable.instance) ExamTable.instance = new ExamTable();
    return ExamTable.instance;
  }

  private readonly koreanDay = ['첫째날', '둘째날', '셋째날', '넷째날'];
  private readonly nonExamInfoList = ['시험 정보가 업데이트 되지 않았습니다.', '시험 정보를 제공해 주세요 :)', '시험 정보가 제공되면 객관식 밑 서술형 문항 갯수와 시험 범위를 확인하실 수 있습니다.'];

  private makeModalWindow(subject: Subject): HTMLElement {
    const attribute = subject.examAttribute;
    const paragraphs =
      attribute
        ? attribute.ranges
        : this.nonExamInfoList;
    const footer =
      attribute
        ? [`객관식 ${attribute.selective}개`, `서술형 ${attribute.descriptive}개`]
        : null;
    return $makeModalWindow(subject + '', paragraphs, footer);
  }
  private onExamTdClicked(subject: Subject) {
    $popup(this.makeModalWindow(subject));
  }
  private formatDate(day: Date): string {
    return `${day.getMonth() + 1}/${day.getDate()} ${weekName[day.getDay() - 1] || ''}`;
  }
  private makeHead(): cellGenerator[][] {
    const koreanDayCell: cellGenerator[] = [() => { }];
    const numberDayCell: cellGenerator[] = [() => { }];
    Setting.getExamList().forEach(({ day }, index) => {
      koreanDayCell.push(
        cell => {
          cell.textContent = this.koreanDay[index];
        }
      );
      numberDayCell.push(
        cell => {
          cell.textContent = `${this.formatDate(day)}`;
        }
      );
    });
    return [koreanDayCell, numberDayCell];
  }
  private makeBody(): cellGenerator[][] | null {
    if (Setting.getExamList().length == 0) return null;

    const genses: cellGenerator[][] = [];
    const maxSize = Math.max(...Setting.getExamList().map(exams => exams.subjects.length));
    const examsByTime: any[][] = new Array(maxSize).fill(null).map(_ => []);
    Setting.getExamList().forEach(exams => examsByTime.forEach((arr, idx) => arr.push(exams.subjects[idx])));
    examsByTime.forEach((exams, index) => {
      const tr = document.createElement('tr');
      tr.appendChild($createElementWithText('th', (index + 1) + '교시'));
      const gens: cellGenerator[] = [];
      gens.push(
        cell => cell.textContent = (index + 1) + '교시');
      for (const subject of exams) {
        if (subject == undefined) gens.push(cell => cell.textContent = '-');
        else if (subject == SelfStudy) {
          gens.push(cell => cell.textContent = '자습');
        } else {
          gens.push(cell => {
            cell.textContent = subject;
            cell.onclick = () => this.onExamTdClicked(subject);
          });
        }
      }
      genses.push(gens);
    });
    return genses;
  }
  static reload() {
    const instance = ExamTable.getInstance();
    let table = document.querySelector('#' + instance.id);
    const body = instance.makeBody();
    body != null
      && table?.replaceWith(
        instance.make(instance.makeHead(), body));
  }
}
class MoakTestNoti {
  private static instance: MoakTestNoti;

  private constructor() { }

  private static getInstance(): MoakTestNoti {
    if (!MoakTestNoti.instance) MoakTestNoti.instance = new MoakTestNoti();
    return MoakTestNoti.instance;
  }

  private toLocale(date: Date): string {
    return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
  }
  private getDDay(targetDate: Date): number {
    const today = new Date();
    const timeDiff = targetDate.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  }
  private getFastestDDay(): { date: string, dDay: number } | null {
    for (const mockTest of Setting.getMoakTests()) {
      const dDay = this.getDDay(mockTest);
      if (dDay >= 0) return {
        date: this.toLocale(mockTest),
        dDay: dDay
      };
    }
    return null;
  }
  private formetDateAndDDay(date: Date): string {
    return `${this.toLocale(date)}: D-day ${this.getDDay(date)}일`;
  }
  private getTestList(): string[] {
    const testList = Setting.getMoakTests().map(time => this.formetDateAndDDay(time));
    if (Setting.getCSAT() != null) testList.push(`수능: ${this.formetDateAndDDay(Setting.getCSAT()!)}`);
    return testList;
  }
  private makeModalWindow(): HTMLElement {
    return $makeModalWindow(
      (Setting.getMoakTests().length == 0)
        ? '수능'
        : (Setting.getCSAT())
          ? '모의고사 및 수능'
          : '모의고사',
      this.getTestList()
    );
  }
  private getText(): { title: string, subtitle: string | undefined } | null {
    if (this.getTestList().length == 0) return null;
    let title, subtitle;
    const dDay = this.getFastestDDay();
    if (dDay == null) {
      if (Setting.getMoakTests().length != 0) {
        title = Setting.getCSAT() ? '[모의고사 및 수능 모두보기 ▾]' : '[모의고사 모두보기 ▾]';
      } else {
        title = `수능 ${this.toLocale(Setting.getCSAT()!)}`
        subtitle = `D-day ${this.getDDay(Setting.getCSAT()!)}일`
      }
    } else {
      title = `모의고사 ${dDay.date}`;
      subtitle = `D-day ${dDay.dDay}일`;
    }
    return { title, subtitle };
  }
  public static reload() {
    const instance = MoakTestNoti.getInstance();
    if ((instance.getTestList().length == 0)) return;

    const mockTestNotiDiv = document.querySelector('#moak_test_noti');
    mockTestNotiDiv?.addEventListener('click',
      () => $popup(
        instance.makeModalWindow()));
    const text = instance.getText();
    if (text == null) return;
    mockTestNotiDiv?.replaceChildren($createElementWithText('div', text.title));
    if (text.subtitle != null) mockTestNotiDiv?.appendChild($createElementWithText('div', text.subtitle));
  }
}
const Previouis = { currentClass: -100, weekIndex: -100 };
const updateMainScreen = (weekIndex: number, currentClass: number) => {
  if (currentClass != Previouis.currentClass) {
    if (currentClass > 0) {
      const textTime = document.querySelector('#text_time');
      if (textTime != null) textTime.textContent = `>> ${currentClass}교시 <<`;
    }
    SimpleTable.reload(weekIndex, currentClass);
    Previouis.currentClass = currentClass;
  }
  if (weekIndex != Previouis.weekIndex) {
    MainTable.reload(weekIndex);
    Previouis.weekIndex = weekIndex;
  }
}
type DateType = { day: number, hours: number, minutes: number, seconds: number };
const getDate = (): DateType => {
  const date = new Date();
  return {
    day: date.getDay(),
    hours: date.getHours(),
    minutes: date.getMinutes(),
    seconds: date.getSeconds()
  };
}
const toWeekdayPreiod = (idx: number): number => {
  if (idx > 0 && idx < 6) return idx - 1;
  return -1;
}
const render = () => {
  const time = getDate();
  const weekIndex = toWeekdayPreiod(time.day);
  const classTime = Setting.getClassTime()?.getCurrentClass(time);
  const currentClass = classTime || -1;
  updateMainScreen(weekIndex, currentClass);
  if (time.day != 0 && time.day != 6) updateSchoolTimeBar(time);
}
const getSchoolTime = (): { hours: number, minutes: number, seconds: number } => {
  const classTime = Setting.getClassTime();
  if (!classTime) throw new Error();
  const schoolTime = classTime.classTimes.end;
  return {
    hours: schoolTime[0],
    minutes: schoolTime[1],
    seconds: 0
  };
}
const getTimeUntilSchoolTime = (date: DateType): number => {
  const schoolTime = getSchoolTime();
  const untilHours = schoolTime.hours - date.hours;
  const untilMinutes = schoolTime.minutes - date.minutes;
  const untilSeconds = schoolTime.seconds - date.seconds;
  return untilHours * 3600 + untilMinutes * 60 + untilSeconds;
}
const isSchoolTime = (date: DateType): boolean => {
  return getTimeUntilSchoolTime(date) >= 0;
}
const fix = (num: number): string => num.toFixed(1);
const getTimeBarText = (date: DateType) => {
  const sumTime = getTimeUntilSchoolTime(date);
  return `하교까지 약 <span>${fix(sumTime / 3600)}</span>시간 = <span>${fix(sumTime / 60)}</span>분 = <span>${sumTime}</span>초 남았다!`;
}
const updateSchoolTimeBar = (date: DateType) => {
  const footer = document.getElementById('footer');
  try {
    if (isSchoolTime(date) && footer != null) footer.innerHTML = getTimeBarText(date);
  } catch (error) { }
}
const BaseDocument = `<header><p id="title" class="lin">&lt Time Table &gt</p></header><main id="main"><p id="text_time" class="lin"></p><table id="today_time_table"></table><table id="time_table"></table><table id="exam_time_table"></table><div id="moak_test_noti"></div></main><footer><p id="footer"></p></footer>`;
// load page
export const load = () => {
  document.body.innerHTML = BaseDocument;
  ExamTable.reload();
  MoakTestNoti.reload();
  setInterval(render, 1);

  // const tt = new Table('fff', '오늘').make(['1', '2'], [[(a) => { a.textContent = '11' }]]);
  // console.log(tt)
  // document.body.appendChild(tt);
}