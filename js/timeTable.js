import { Setting, SelfStudy } from './timeTableAPI.js';
const $removeEmpty = function (list) {
    const relist = [];
    list.forEach(ele => relist.push(ele));
    return relist;
};
const weekName = ['월', '화', '수', '목', '금'];
const EventHandler = {
    onSubjectTdClicked: (subjectTd) => {
        var _a, _b;
        if (subjectTd == null)
            return;
        const td = subjectTd;
        td === null || td === void 0 ? void 0 : td.style.setProperty('display', 'none');
        (_b = (_a = td === null || td === void 0 ? void 0 : td.parentElement) === null || _a === void 0 ? void 0 : _a.querySelector('.teacher_name')) === null || _b === void 0 ? void 0 : _b.style.setProperty('display', 'block');
    },
    onTeacherTdClicked: (teacherTd) => {
        var _a, _b;
        if (teacherTd == null)
            return;
        const td = teacherTd;
        td === null || td === void 0 ? void 0 : td.style.setProperty('display', 'none');
        (_b = (_a = td === null || td === void 0 ? void 0 : td.parentElement) === null || _a === void 0 ? void 0 : _a.querySelector('.subject_name')) === null || _b === void 0 ? void 0 : _b.style.setProperty('display', 'block');
    }
};
const $createElementWithText = (tag, textContent) => {
    const element = document.createElement(tag);
    element.parentElement;
    element.textContent = textContent;
    return element;
};
const $makeClickableSubject = (subjectName) => {
    const p = $createElementWithText('p', subjectName);
    p.classList.add('subject_name');
    p.onclick = event => EventHandler.onSubjectTdClicked(event.target);
    return p;
};
const $makeClickableTeacher = (teacherName) => {
    const p = $createElementWithText('p', teacherName);
    p.classList.add('teacher_name');
    p.style.display = 'none';
    p.onclick = event => EventHandler.onTeacherTdClicked(event.target);
    return p;
};
const $makeClickableTd = (subjectName, teacherName) => {
    const td = document.createElement('td');
    td.appendChild($makeClickableSubject(subjectName));
    td.appendChild($makeClickableTeacher(teacherName));
    return td;
};
const $makeModalWindow = (title, paragraphs, footer = null) => {
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
    paragraphs.forEach(p => paragraphUl.appendChild($createElementWithText('li', p)));
    main.appendChild(paragraphUl);
    if (footer) {
        const footerUl = document.createElement('ul');
        footerUl.classList.add('footer');
        footer.forEach(f => footerUl.appendChild($createElementWithText('li', f)));
        main.appendChild(footerUl);
    }
    textDiv.appendChild(main);
    popupDiv.appendChild(textDiv);
    return popupDiv;
};
const $popup = (modal) => {
    var _a;
    (_a = document.querySelector('#main')) === null || _a === void 0 ? void 0 : _a.appendChild(modal);
};
class Table {
    constructor(id, caption) {
        this.id = id;
        this.caption = caption;
    }
}
class SimpleTable extends Table {
    constructor() { super('today_time_table', '오늘의 시간표'); }
    static getInstance() {
        if (!SimpleTable.instance)
            SimpleTable.instance = new SimpleTable();
        return SimpleTable.instance;
    }
    getClassLength(weekIndex) {
        return Setting.getSubjectsByTime()[weekIndex]
            ? Setting.getSubjectsByTime()[weekIndex].length
            : 0;
    }
    makeHead(weekIndex, currentClass) {
        const thead = document.createElement('thead');
        const tr = document.createElement('tr');
        for (let i = 1; i <= this.getClassLength(weekIndex); i++) {
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
            const td = $makeClickableTd(sub + '', sub.teacher);
            if (idx == currentClass - 1)
                td.classList.add('lin-highlight1');
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
        return tbody;
    }
    makeHoliday() {
        const div = document.createElement('div');
        div.classList.add('lin-highlight1');
        div.appendChild($createElementWithText('p', '오늘은 신나는 휴일!'));
        return div;
    }
    static reload(weekIndex, currentClass) {
        const instance = SimpleTable.getInstance();
        const table = document.querySelector('#' + instance.id);
        if (weekIndex == -1)
            table === null || table === void 0 ? void 0 : table.replaceChildren(instance.makeHoliday());
        else
            table === null || table === void 0 ? void 0 : table.replaceChildren($createElementWithText('caption', instance.caption), instance.makeHead(weekIndex, currentClass), instance.makeBody(weekIndex, currentClass));
    }
}
class MainTable extends Table {
    constructor() { super('time_table', 'Time Table'); }
    static getInstance() {
        if (!MainTable.instance)
            MainTable.instance = new MainTable();
        return MainTable.instance;
    }
    getMaxClassLength() {
        return Math.max(...$removeEmpty(Setting.getSubjectsByTime()).map(s => s.length));
    }
    makeRow(weekIndex, subjects, highlight) {
        const tr = document.createElement('tr');
        if (highlight)
            tr.classList.add('lin-highlight2');
        tr.appendChild($createElementWithText('th', weekName[weekIndex] + '요일'));
        if (subjects) {
            for (let i = 0; i < this.getMaxClassLength(); i++) {
                const subject = subjects[i];
                tr.appendChild(subject
                    ? $makeClickableTd(subject + '', subject.teacher)
                    : tr.appendChild($createElementWithText('td', '-')));
            }
        }
        return tr;
    }
    makeHead() {
        const thead = document.createElement('thead');
        const tr = document.createElement('tr');
        tr.appendChild(document.createElement('th'));
        for (let i = 1; i <= this.getMaxClassLength(); i++)
            tr.appendChild($createElementWithText('th', i + '교시'));
        thead.appendChild(tr);
        return thead;
    }
    makeBody(weekIndex) {
        const tbody = document.createElement('tbody');
        for (let i = 0; i < 5; i++) {
            tbody.appendChild(this.makeRow(i, Setting.getSubjectsByTime()[i], weekIndex == i));
        }
        return tbody;
    }
    static reload(weekIndex) {
        const instance = MainTable.getInstance();
        const table = document.querySelector('#' + instance.id);
        table === null || table === void 0 ? void 0 : table.replaceChildren($createElementWithText('caption', instance.caption), instance.makeHead(), instance.makeBody(weekIndex));
    }
}
class ExamTable extends Table {
    constructor() {
        super('exam_time_table', '시험 시간표');
        this.koreanDay = ['첫째날', '둘째날', '셋째날', '넷째날'];
        this.nonExamInfoList = ['시험 정보가 업데이트 되지 않았습니다.', '시험 정보를 제공해 주세요 :)', '시험 정보가 제공되면 객관식 밑 서술형 문항 갯수와 시험 범위를 확인하실 수 있습니다.'];
    }
    static getInstance() {
        if (!ExamTable.instance)
            ExamTable.instance = new ExamTable();
        return ExamTable.instance;
    }
    makeModalWindow(subject) {
        const attribute = subject.examAttribute;
        const paragraphs = attribute
            ? attribute.ranges
            : this.nonExamInfoList;
        const footer = attribute
            ? [`객관식 ${attribute.selective}개`, `서술형 ${attribute.descriptive}개`]
            : null;
        return $makeModalWindow(subject + '', paragraphs, footer);
    }
    onExamTdClicked(subject) {
        $popup(this.makeModalWindow(subject));
    }
    formatDate(day) {
        return `${day.getMonth() + 1}/${day.getDate()} ${weekName[day.getDay() - 1] || ''}`;
    }
    makeHead() {
        const thead = document.createElement('thead');
        const koreanDayTr = document.createElement('tr');
        koreanDayTr.appendChild(document.createElement('th'));
        const numberDayTr = document.createElement('tr');
        numberDayTr.appendChild(document.createElement('th'));
        Setting.getExamList().forEach(({ day }, index) => {
            koreanDayTr.appendChild($createElementWithText('th', this.koreanDay[index]));
            numberDayTr.appendChild($createElementWithText('th', `${this.formatDate(day)}`));
        });
        thead.appendChild(koreanDayTr);
        thead.appendChild(numberDayTr);
        return thead;
    }
    makeBody() {
        if (Setting.getExamList().length == 0)
            return null;
        const tbody = document.createElement('tbody');
        const maxSize = Math.max(...Setting.getExamList().map(exams => exams.subjects.length));
        const examsByTime = new Array(maxSize).fill(null).map(_ => []);
        Setting.getExamList().forEach(exams => examsByTime.forEach((arr, idx) => arr.push(exams.subjects[idx])));
        examsByTime.forEach((exams, index) => {
            const tr = document.createElement('tr');
            tr.appendChild($createElementWithText('th', (index + 1) + '교시'));
            for (const subject of exams) {
                let td;
                if (subject == undefined)
                    td = $createElementWithText('td', '-');
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
        if (body != null)
            table === null || table === void 0 ? void 0 : table.replaceChildren($createElementWithText('caption', instance.caption), instance.makeHead(), body);
    }
}
class MoakTestNoti {
    constructor() { }
    static getInstance() {
        if (!MoakTestNoti.instance)
            MoakTestNoti.instance = new MoakTestNoti();
        return MoakTestNoti.instance;
    }
    toLocale(date) {
        return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
    }
    getDDay(targetDate) {
        const today = new Date();
        const timeDiff = targetDate.getTime() - today.getTime();
        return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    }
    getFastestDDay() {
        for (const mockTest of Setting.getMoakTests()) {
            const dDay = this.getDDay(mockTest);
            if (dDay >= 0)
                return {
                    date: this.toLocale(mockTest),
                    dDay: dDay
                };
        }
        return null;
    }
    formetDateAndDDay(date) {
        return `${this.toLocale(date)}: D-day ${this.getDDay(date)}일`;
    }
    getTestList() {
        const testList = Setting.getMoakTests().map(time => this.formetDateAndDDay(time));
        if (Setting.getCSAT() != null)
            testList.push(`수능: ${this.formetDateAndDDay(Setting.getCSAT())}`);
        return testList;
    }
    makeModalWindow() {
        return $makeModalWindow((Setting.getMoakTests().length == 0)
            ? '수능'
            : (Setting.getCSAT())
                ? '모의고사 및 수능'
                : '모의고사', this.getTestList());
    }
    getText() {
        if (this.getTestList().length == 0)
            return null;
        let title, subtitle;
        const dDay = this.getFastestDDay();
        if (dDay == null) {
            if (Setting.getMoakTests().length != 0) {
                title = Setting.getCSAT() ? '[모의고사 및 수능 모두보기 ▾]' : '[모의고사 모두보기 ▾]';
            }
            else {
                title = `수능 ${this.toLocale(Setting.getCSAT())}`;
                subtitle = `D-day ${this.getDDay(Setting.getCSAT())}일`;
            }
        }
        else {
            title = `모의고사 ${dDay.date}`;
            subtitle = `D-day ${dDay.dDay}일`;
        }
        return { title, subtitle };
    }
    static reload() {
        const instance = MoakTestNoti.getInstance();
        if ((instance.getTestList().length == 0))
            return;
        const mockTestNotiDiv = document.querySelector('#moak_test_noti');
        mockTestNotiDiv === null || mockTestNotiDiv === void 0 ? void 0 : mockTestNotiDiv.addEventListener('click', () => $popup(instance.makeModalWindow()));
        const text = instance.getText();
        if (text == null)
            return;
        mockTestNotiDiv === null || mockTestNotiDiv === void 0 ? void 0 : mockTestNotiDiv.replaceChildren($createElementWithText('div', text.title));
        if (text.subtitle != null)
            mockTestNotiDiv === null || mockTestNotiDiv === void 0 ? void 0 : mockTestNotiDiv.appendChild($createElementWithText('div', text.subtitle));
    }
}
const Previouis = { currentClass: -100, weekIndex: -100 };
const updateMainScreen = (weekIndex, currentClass) => {
    if (currentClass != Previouis.currentClass) {
        if (currentClass > 0) {
            const textTime = document.querySelector('#text_time');
            if (textTime != null)
                textTime.textContent = `>> ${currentClass}교시 <<`;
        }
        SimpleTable.reload(weekIndex, currentClass);
        Previouis.currentClass = currentClass;
    }
    if (weekIndex != Previouis.weekIndex) {
        MainTable.reload(weekIndex);
        Previouis.weekIndex = weekIndex;
    }
};
const getDate = () => {
    const date = new Date();
    return {
        day: date.getDay(),
        hours: date.getHours(),
        minutes: date.getMinutes(),
        seconds: date.getSeconds()
    };
};
const toWeekdayPreiod = (idx) => {
    if (idx > 0 && idx < 6)
        return idx - 1;
    return -1;
};
const render = () => {
    var _a;
    const time = getDate();
    const weekIndex = toWeekdayPreiod(time.day);
    const classTime = (_a = Setting.getClassTime()) === null || _a === void 0 ? void 0 : _a.getCurrentClass(time);
    const currentClass = classTime || -1;
    updateMainScreen(weekIndex, currentClass);
    if (time.day != 0 && time.day != 6)
        updateSchoolTimeBar(time);
};
const getSchoolTime = () => {
    const classTime = Setting.getClassTime();
    if (!classTime)
        throw new Error();
    const schoolTime = classTime.classTimes.end;
    return {
        hours: schoolTime[0],
        minutes: schoolTime[1],
        seconds: 0
    };
};
const getTimeUntilSchoolTime = (date) => {
    const schoolTime = getSchoolTime();
    const untilHours = schoolTime.hours - date.hours;
    const untilMinutes = schoolTime.minutes - date.minutes;
    const untilSeconds = schoolTime.seconds - date.seconds;
    return untilHours * 3600 + untilMinutes * 60 + untilSeconds;
};
const isSchoolTime = (date) => {
    return getTimeUntilSchoolTime(date) >= 0;
};
const fix = (num) => num.toFixed(1);
const getTimeBarText = (date) => {
    const sumTime = getTimeUntilSchoolTime(date);
    return `하교까지 약 <span>${fix(sumTime / 3600)}</span>시간 = <span>${fix(sumTime / 60)}</span>분 = <span>${sumTime}</span>초 남았다!`;
};
const updateSchoolTimeBar = (date) => {
    const footer = document.getElementById('footer');
    try {
        if (isSchoolTime(date) && footer != null)
            footer.innerHTML = getTimeBarText(date);
    }
    catch (error) { }
};
const BaseDocument = `<header><p id="title" class="lin">&lt Time Table &gt</p></header><main id="main"><p id="text_time" class="lin"></p><table id="today_time_table"></table><table id="time_table"></table><table id="exam_time_table"></table><div id="moak_test_noti"></div></main><footer><p id="footer"></p></footer>`;
// load page
export const load = () => {
    document.body.innerHTML = BaseDocument;
    ExamTable.reload();
    MoakTestNoti.reload();
    setInterval(render, 1);
};
