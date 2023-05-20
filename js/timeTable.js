"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.load = void 0;
var timeTableAPI_js_1 = require("./timeTableAPI.js");
var $removeEmpty = function (list) {
    var relist = [];
    list.forEach(function (ele) { return relist.push(ele); });
    return relist;
};
var weekName = ['월', '화', '수', '목', '금'];
var EventHandler = {
    onSubjectTdClicked: function (subjectTd) {
        var _a, _b;
        if (subjectTd == null)
            return;
        var td = subjectTd;
        td === null || td === void 0 ? void 0 : td.style.setProperty('display', 'none');
        (_b = (_a = td === null || td === void 0 ? void 0 : td.parentElement) === null || _a === void 0 ? void 0 : _a.querySelector('.teacher_name')) === null || _b === void 0 ? void 0 : _b.style.setProperty('display', 'block');
    },
    onTeacherTdClicked: function (teacherTd) {
        var _a, _b;
        if (teacherTd == null)
            return;
        var td = teacherTd;
        td === null || td === void 0 ? void 0 : td.style.setProperty('display', 'none');
        (_b = (_a = td === null || td === void 0 ? void 0 : td.parentElement) === null || _a === void 0 ? void 0 : _a.querySelector('.subject_name')) === null || _b === void 0 ? void 0 : _b.style.setProperty('display', 'block');
    }
};
var $createElementWithText = function (tag, textContent) {
    var element = document.createElement(tag);
    element.textContent = textContent;
    return element;
};
var $makeClickableSubject = function (subjectName) {
    var p = $createElementWithText('p', subjectName);
    p.classList.add('subject_name');
    p.onclick = function (event) { return EventHandler.onSubjectTdClicked(event.target); };
    return p;
};
var $makeClickableTeacher = function (teacherName) {
    var p = $createElementWithText('p', teacherName);
    p.classList.add('teacher_name');
    p.style.display = 'none';
    p.onclick = function (event) { return EventHandler.onTeacherTdClicked(event.target); };
    return p;
};
var $makeClickableTd = function (subjectName, teacherName) {
    var td = document.createElement('td');
    td.appendChild($makeClickableSubject(subjectName));
    td.appendChild($makeClickableTeacher(teacherName));
    return td;
};
var $makeModalWindow = function (title, paragraphs, footer) {
    if (footer === void 0) { footer = null; }
    var popupDiv = document.createElement('div');
    popupDiv.id = 'popup';
    var textDiv = document.createElement('div');
    textDiv.classList.add('text');
    var header = document.createElement('header');
    header.appendChild($createElementWithText('div', title));
    var button = document.createElement('button');
    button.appendChild(document.createElement('div'));
    button.appendChild(document.createElement('div'));
    button.onclick = function () { return popupDiv.remove(); };
    header.appendChild(button);
    textDiv.appendChild(header);
    var main = document.createElement('main');
    var paragraphUl = document.createElement('ul');
    paragraphUl.classList.add('paragraph');
    paragraphs.forEach(function (p) {
        return paragraphUl.appendChild($createElementWithText('li', p));
    });
    main.appendChild(paragraphUl);
    if (footer) {
        var footerUl_1 = document.createElement('ul');
        footerUl_1.classList.add('footer');
        footer.forEach(function (f) { return footerUl_1.appendChild($createElementWithText('li', f)); });
        main.appendChild(footerUl_1);
    }
    textDiv.appendChild(main);
    popupDiv.appendChild(textDiv);
    return popupDiv;
};
var $popup = function (modal) {
    var _a;
    (_a = document.querySelector('#main')) === null || _a === void 0 ? void 0 : _a.appendChild(modal);
};
var Table = /** @class */ (function () {
    function Table(id, caption) {
        this.id = id;
        this.caption = caption;
    }
    return Table;
}());
var SimpleTable = /** @class */ (function (_super) {
    __extends(SimpleTable, _super);
    function SimpleTable() {
        return _super.call(this, 'today_time_table', '오늘의 시간표') || this;
    }
    SimpleTable.getInstance = function () {
        if (!SimpleTable.instance)
            SimpleTable.instance = new SimpleTable();
        return SimpleTable.instance;
    };
    SimpleTable.prototype.getClassLength = function (weekIndex) {
        return timeTableAPI_js_1.Setting.getSubjectsByTime()[weekIndex]
            ? timeTableAPI_js_1.Setting.getSubjectsByTime()[weekIndex].length
            : 0;
    };
    SimpleTable.prototype.makeHead = function (weekIndex, currentClass) {
        var thead = document.createElement('thead');
        var tr = document.createElement('tr');
        for (var i = 1; i <= this.getClassLength(weekIndex); i++) {
            var th = $createElementWithText('th', i + '교시');
            i == currentClass && th.classList.add('lin-highlight1');
            tr.appendChild(th);
        }
        thead.appendChild(tr);
        return thead;
    };
    SimpleTable.prototype.makeBody = function (weekIndex, currentClass) {
        var tbody = document.createElement('tbody');
        var tr = document.createElement('tr');
        var subjectByTime = timeTableAPI_js_1.Setting.getSubjectsByTime();
        subjectByTime.length != 0 && subjectByTime[weekIndex] && subjectByTime[weekIndex].forEach(function (sub, idx) {
            var td = $makeClickableTd(sub + '', sub.teacher);
            if (idx == currentClass - 1)
                td.classList.add('lin-highlight1');
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
        return tbody;
    };
    SimpleTable.prototype.makeHoliday = function () {
        var div = document.createElement('div');
        div.classList.add('lin-highlight1');
        div.appendChild($createElementWithText('p', '오늘은 신나는 휴일!'));
        return div;
    };
    SimpleTable.reload = function (weekIndex, currentClass) {
        var instance = SimpleTable.getInstance();
        var table = document.querySelector('#' + instance.id);
        if (weekIndex == -1)
            table === null || table === void 0 ? void 0 : table.replaceChildren(instance.makeHoliday());
        else
            table === null || table === void 0 ? void 0 : table.replaceChildren($createElementWithText('caption', instance.caption), instance.makeHead(weekIndex, currentClass), instance.makeBody(weekIndex, currentClass));
    };
    return SimpleTable;
}(Table));
var MainTable = /** @class */ (function (_super) {
    __extends(MainTable, _super);
    function MainTable() {
        return _super.call(this, 'time_table', 'Time Table') || this;
    }
    MainTable.getInstance = function () {
        if (!MainTable.instance)
            MainTable.instance = new MainTable();
        return MainTable.instance;
    };
    MainTable.prototype.getMaxClassLength = function () {
        return Math.max.apply(Math, $removeEmpty(timeTableAPI_js_1.Setting.getSubjectsByTime()).map(function (s) { return s.length; }));
    };
    MainTable.prototype.makeRow = function (weekIndex, subjects, highlight) {
        var tr = document.createElement('tr');
        if (highlight)
            tr.classList.add('lin-highlight2');
        tr.appendChild($createElementWithText('th', weekName[weekIndex] + '요일'));
        if (subjects) {
            for (var i = 0; i < this.getMaxClassLength(); i++) {
                var subject = subjects[i];
                tr.appendChild(subject
                    ? $makeClickableTd(subject + '', subject.teacher)
                    : tr.appendChild($createElementWithText('td', '-')));
            }
        }
        return tr;
    };
    MainTable.prototype.makeHead = function () {
        var thead = document.createElement('thead');
        var tr = document.createElement('tr');
        tr.appendChild(document.createElement('th'));
        for (var i = 1; i <= this.getMaxClassLength(); i++)
            tr.appendChild($createElementWithText('th', i + '교시'));
        thead.appendChild(tr);
        return thead;
    };
    MainTable.prototype.makeBody = function (weekIndex) {
        var tbody = document.createElement('tbody');
        for (var i = 0; i < 5; i++) {
            tbody.appendChild(this.makeRow(i, timeTableAPI_js_1.Setting.getSubjectsByTime()[i], weekIndex == i));
        }
        return tbody;
    };
    MainTable.reload = function (weekIndex) {
        var instance = MainTable.getInstance();
        var table = document.querySelector('#' + instance.id);
        table === null || table === void 0 ? void 0 : table.replaceChildren($createElementWithText('caption', instance.caption), instance.makeHead(), instance.makeBody(weekIndex));
    };
    return MainTable;
}(Table));
var ExamTable = /** @class */ (function (_super) {
    __extends(ExamTable, _super);
    function ExamTable() {
        var _this = _super.call(this, 'exam_time_table', '시험 시간표') || this;
        _this.koreanDay = ['첫째날', '둘째날', '셋째날', '넷째날'];
        _this.nonExamInfoList = ['시험 정보가 업데이트 되지 않았습니다.', '시험 정보를 제공해 주세요 :)', '시험 정보가 제공되면 객관식 밑 서술형 문항 갯수와 시험 범위를 확인하실 수 있습니다.'];
        return _this;
    }
    ExamTable.getInstance = function () {
        if (!ExamTable.instance)
            ExamTable.instance = new ExamTable();
        return ExamTable.instance;
    };
    ExamTable.prototype.makeModalWindow = function (subject) {
        var attribute = subject.examAttribute;
        var paragraphs = attribute
            ? attribute.ranges
            : this.nonExamInfoList;
        var footer = attribute
            ? ["\uAC1D\uAD00\uC2DD " + attribute.selective + "\uAC1C", "\uC11C\uC220\uD615 " + attribute.descriptive + "\uAC1C"]
            : null;
        return $makeModalWindow(subject + '', paragraphs, footer);
    };
    ExamTable.prototype.onExamTdClicked = function (subject) {
        $popup(this.makeModalWindow(subject));
    };
    ExamTable.prototype.formatDate = function (day) {
        return day.getMonth() + 1 + "/" + day.getDate() + " " + (weekName[day.getDay() - 1] || '');
    };
    ExamTable.prototype.makeHead = function () {
        var _this = this;
        var thead = document.createElement('thead');
        var koreanDayTr = document.createElement('tr');
        koreanDayTr.appendChild(document.createElement('th'));
        var numberDayTr = document.createElement('tr');
        numberDayTr.appendChild(document.createElement('th'));
        timeTableAPI_js_1.Setting.getExamList().forEach(function (_a, index) {
            var day = _a.day;
            koreanDayTr.appendChild($createElementWithText('th', _this.koreanDay[index]));
            numberDayTr.appendChild($createElementWithText('th', "" + _this.formatDate(day)));
        });
        thead.appendChild(koreanDayTr);
        thead.appendChild(numberDayTr);
        return thead;
    };
    ExamTable.prototype.makeBody = function () {
        var _this = this;
        if (timeTableAPI_js_1.Setting.getExamList().length == 0)
            return null;
        var tbody = document.createElement('tbody');
        var maxSize = Math.max.apply(Math, timeTableAPI_js_1.Setting.getExamList().map(function (exams) { return exams.subjects.length; }));
        var examsByTime = new Array(maxSize).fill(null).map(function (_) { return []; });
        timeTableAPI_js_1.Setting.getExamList().forEach(function (exams) { return examsByTime.forEach(function (arr, idx) { return arr.push(exams.subjects[idx]); }); });
        examsByTime.forEach(function (exams, index) {
            var tr = document.createElement('tr');
            tr.appendChild($createElementWithText('th', (index + 1) + '교시'));
            var _loop_1 = function (subject) {
                var td = void 0;
                if (subject == undefined)
                    td = $createElementWithText('td', '-');
                else if (subject == timeTableAPI_js_1.SelfStudy) {
                    td = $createElementWithText('td', '자습');
                }
                else {
                    td = $createElementWithText('td', subject);
                    td.onclick = function () { return _this.onExamTdClicked(subject); };
                }
                tr.appendChild(td);
            };
            for (var _i = 0, exams_1 = exams; _i < exams_1.length; _i++) {
                var subject = exams_1[_i];
                _loop_1(subject);
            }
            tbody.appendChild(tr);
        });
        return tbody;
    };
    ExamTable.reload = function () {
        var instance = ExamTable.getInstance();
        var table = document.querySelector('#' + instance.id);
        var body = instance.makeBody();
        if (body != null)
            table === null || table === void 0 ? void 0 : table.replaceChildren($createElementWithText('caption', instance.caption), instance.makeHead(), body);
    };
    return ExamTable;
}(Table));
var MoakTestNoti = /** @class */ (function () {
    function MoakTestNoti() {
    }
    MoakTestNoti.getInstance = function () {
        if (!MoakTestNoti.instance)
            MoakTestNoti.instance = new MoakTestNoti();
        return MoakTestNoti.instance;
    };
    MoakTestNoti.prototype.toLocale = function (date) {
        return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
    };
    MoakTestNoti.prototype.getDDay = function (targetDate) {
        var today = new Date();
        var timeDiff = targetDate.getTime() - today.getTime();
        return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    };
    MoakTestNoti.prototype.getFastestDDay = function () {
        for (var _i = 0, _a = timeTableAPI_js_1.Setting.getMoakTests(); _i < _a.length; _i++) {
            var mockTest = _a[_i];
            var dDay = this.getDDay(mockTest);
            if (dDay >= 0)
                return {
                    date: this.toLocale(mockTest),
                    dDay: dDay
                };
        }
        return null;
    };
    MoakTestNoti.prototype.formetDateAndDDay = function (date) {
        return this.toLocale(date) + ": D-day " + this.getDDay(date) + "\uC77C";
    };
    MoakTestNoti.prototype.getTestList = function () {
        var _this = this;
        var testList = timeTableAPI_js_1.Setting.getMoakTests().map(function (time) { return _this.formetDateAndDDay(time); });
        if (timeTableAPI_js_1.Setting.getCSAT() != null)
            testList.push("\uC218\uB2A5: " + this.formetDateAndDDay(timeTableAPI_js_1.Setting.getCSAT()));
        return testList;
    };
    MoakTestNoti.prototype.makeModalWindow = function () {
        return $makeModalWindow((timeTableAPI_js_1.Setting.getMoakTests().length == 0)
            ? '수능'
            : (timeTableAPI_js_1.Setting.getCSAT())
                ? '모의고사 및 수능'
                : '모의고사', this.getTestList());
    };
    MoakTestNoti.prototype.getText = function () {
        if (this.getTestList().length == 0)
            return null;
        var title, subtitle;
        var dDay = this.getFastestDDay();
        if (dDay == null) {
            if (timeTableAPI_js_1.Setting.getMoakTests().length != 0) {
                title = timeTableAPI_js_1.Setting.getCSAT() ? '[모의고사 및 수능 모두보기 ▾]' : '[모의고사 모두보기 ▾]';
            }
            else {
                title = "\uC218\uB2A5 " + this.toLocale(timeTableAPI_js_1.Setting.getCSAT());
                subtitle = "D-day " + this.getDDay(timeTableAPI_js_1.Setting.getCSAT()) + "\uC77C";
            }
        }
        else {
            title = "\uBAA8\uC758\uACE0\uC0AC " + dDay.date;
            subtitle = "D-day " + dDay.dDay + "\uC77C";
        }
        return { title: title, subtitle: subtitle };
    };
    MoakTestNoti.reload = function () {
        var instance = MoakTestNoti.getInstance();
        if ((instance.getTestList().length == 0))
            return;
        var mockTestNotiDiv = document.querySelector('#moak_test_noti');
        mockTestNotiDiv === null || mockTestNotiDiv === void 0 ? void 0 : mockTestNotiDiv.addEventListener('click', function () { return $popup(instance.makeModalWindow()); });
        var text = instance.getText();
        if (text == null)
            return;
        mockTestNotiDiv === null || mockTestNotiDiv === void 0 ? void 0 : mockTestNotiDiv.replaceChildren($createElementWithText('div', text.title));
        if (text.subtitle != null)
            mockTestNotiDiv === null || mockTestNotiDiv === void 0 ? void 0 : mockTestNotiDiv.appendChild($createElementWithText('div', text.subtitle));
    };
    return MoakTestNoti;
}());
var Previouis = { currentClass: -100, weekIndex: -100 };
var updateMainScreen = function (weekIndex, currentClass) {
    if (currentClass != Previouis.currentClass) {
        if (currentClass > 0) {
            var textTime = document.querySelector('#text_time');
            if (textTime != null)
                textTime.textContent = ">> " + currentClass + "\uAD50\uC2DC <<";
        }
        SimpleTable.reload(weekIndex, currentClass);
        Previouis.currentClass = currentClass;
    }
    if (weekIndex != Previouis.weekIndex) {
        MainTable.reload(weekIndex);
        Previouis.weekIndex = weekIndex;
    }
};
var getDate = function () {
    var date = new Date();
    return {
        day: date.getDay(),
        hours: date.getHours(),
        minutes: date.getMinutes(),
        seconds: date.getSeconds()
    };
};
var toWeekdayPreiod = function (idx) {
    if (idx > 0 && idx < 6)
        return idx - 1;
    return -1;
};
var render = function () {
    var _a;
    var time = getDate();
    var weekIndex = toWeekdayPreiod(time.day);
    var classTime = (_a = timeTableAPI_js_1.Setting.getClassTime()) === null || _a === void 0 ? void 0 : _a.getCurrentClass(time);
    var currentClass = classTime || -1;
    updateMainScreen(weekIndex, currentClass);
    if (time.day != 0 && time.day != 6)
        updateSchoolTimeBar(time);
};
var getSchoolTime = function () {
    var classTime = timeTableAPI_js_1.Setting.getClassTime();
    if (!classTime)
        throw new Error();
    var schoolTime = classTime.classTimes.end;
    return {
        hours: schoolTime[0],
        minutes: schoolTime[1],
        seconds: 0
    };
};
var getTimeUntilSchoolTime = function (date) {
    var schoolTime = getSchoolTime();
    var untilHours = schoolTime.hours - date.hours;
    var untilMinutes = schoolTime.minutes - date.minutes;
    var untilSeconds = schoolTime.seconds - date.seconds;
    return untilHours * 3600 + untilMinutes * 60 + untilSeconds;
};
var isSchoolTime = function (date) {
    return getTimeUntilSchoolTime(date) >= 0;
};
var fix = function (num) { return num.toFixed(1); };
var getTimeBarText = function (date) {
    var sumTime = getTimeUntilSchoolTime(date);
    return "\uD558\uAD50\uAE4C\uC9C0 \uC57D <span>" + fix(sumTime / 3600) + "</span>\uC2DC\uAC04 = <span>" + fix(sumTime / 60) + "</span>\uBD84 = <span>" + sumTime + "</span>\uCD08 \uB0A8\uC558\uB2E4!";
};
var updateSchoolTimeBar = function (date) {
    var footer = document.getElementById('footer');
    try {
        if (isSchoolTime(date) && footer != null)
            footer.innerHTML = getTimeBarText(date);
    }
    catch (error) { }
};
var BaseDocument = "<header><p id=\"title\" class=\"lin\">&lt Time Table &gt</p></header><main id=\"main\"><p id=\"text_time\" class=\"lin\"></p><table id=\"today_time_table\"></table><table id=\"time_table\"></table><table id=\"exam_time_table\"></table><div id=\"moak_test_noti\"></div></main><footer><p id=\"footer\"></p></footer>";
// load page
exports.load = function () {
    document.body.innerHTML = BaseDocument;
    ExamTable.reload();
    MoakTestNoti.reload();
    setInterval(render, 1);
};
