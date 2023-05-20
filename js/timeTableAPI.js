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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.loadPage = exports.SelfStudy = exports.Setting = exports.Day = exports.SubjectList = exports.SuffixType = exports.Subject = exports.ExamAttribute = exports.ClassTimeList = void 0;
var ClassTimeList = /** @class */ (function () {
    function ClassTimeList(start, end, maxClass) {
        this.maxClass = maxClass;
        this.classTimes = { start: start, end: end, other: [] };
    }
    ClassTimeList.prototype.getDuration = function (previousTime, currentTime) {
        return (currentTime[0] - previousTime[0]) * 60 + currentTime[1] - previousTime[1];
    };
    ClassTimeList.prototype.checkAllIn = function () {
        return this.classTimes.other.length == this.maxClass;
    };
    ClassTimeList.prototype.checkOrder = function () {
        return this.get().map(function (time) { return time[2]; }).every(function (duration) { return duration >= 0; });
    };
    ClassTimeList.prototype.addClassTime = function (hours, minutes) {
        if (this.classTimes.other.length < this.maxClass)
            this.classTimes.other.push([hours, minutes]);
        else
            throw new Error('ClassTime is already max length.');
        if (!this.checkOrder())
            throw new Error('Invalid class time order. Class times should be in chronological order.');
    };
    ClassTimeList.prototype.getElapsedTime = function (fromHour, fromMinute, toHour, toMinute) {
        return ((toHour - fromHour) * 60) + toMinute - fromMinute;
    };
    ClassTimeList.prototype.get = function () {
        var times = [];
        var durations = [];
        times.push(__spreadArrays(this.classTimes.start));
        for (var _i = 0, _a = Object.values(this.classTimes.other); _i < _a.length; _i++) {
            var time = _a[_i];
            var prev = times[times.length - 1];
            durations.push(this.getDuration(prev, time));
            times.push(__spreadArrays(time));
        }
        durations.push(this.getDuration(times[times.length - 1], this.classTimes.end));
        durations.push(0);
        times.push(__spreadArrays(this.classTimes.end));
        for (var i = 0; i < times.length; i++) {
            times[i].push(durations[i]);
        }
        return times;
    };
    ClassTimeList.prototype.getCurrent = function (hours, minutes) {
        var _this = this;
        var returnIndex = -1;
        this.get().forEach(function (_a, index) {
            var startHour = _a[0], startMinutes = _a[1], duration = _a[2];
            var pre = _this.getElapsedTime(startHour, startMinutes, hours, minutes);
            if (pre >= 0 && pre < duration)
                returnIndex = index;
        });
        return returnIndex;
    };
    ClassTimeList.prototype.getCurrentClass = function (_a) {
        var hours = _a.hours, minutes = _a.minutes;
        if (!this.checkAllIn())
            throw new Error("ClassTime's length must be maxClass(" + this.maxClass + ")");
        var idx = this.getCurrent(hours, minutes);
        return (idx == 0) ? 1 : idx;
    };
    return ClassTimeList;
}());
exports.ClassTimeList = ClassTimeList;
var ExamAttribute = /** @class */ (function () {
    function ExamAttribute(selective, descriptive) {
        this.ranges = [];
        this.selective = selective;
        this.descriptive = descriptive;
    }
    ExamAttribute.prototype.addRange = function (range) {
        this.ranges.push(range);
        return this;
    };
    return ExamAttribute;
}());
exports.ExamAttribute = ExamAttribute;
var Subject = /** @class */ (function () {
    function Subject(subjectName, teacher) {
        this.examAttribute = null;
        this.subjectName = subjectName;
        this.teacher = teacher;
    }
    Subject.prototype.toString = function () {
        return this.subjectName;
    };
    Subject.prototype.setExam = function (examAttribute) {
        this.examAttribute = examAttribute;
    };
    return Subject;
}());
exports.Subject = Subject;
var SuffixType;
(function (SuffixType) {
    SuffixType["NUMBER"] = "NUMBER";
    SuffixType["ALPABET"] = "ALPABET";
    SuffixType["ROMAN"] = "ROMAN";
})(SuffixType = exports.SuffixType || (exports.SuffixType = {}));
var SuffixTypes = {
    NUMBER: [1, 2, 3, 4, 5],
    ALPABET: ['A', 'B', 'C', 'D', 'E'],
    ROMAN: ['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ']
};
var MultipleSubject = /** @class */ (function (_super) {
    __extends(MultipleSubject, _super);
    function MultipleSubject(subjectName, teacher, suffix, fullName) {
        var _this = _super.call(this, subjectName, teacher) || this;
        _this.suffix = suffix;
        _this.fullName = fullName;
        return _this;
    }
    MultipleSubject.prototype.toString = function () {
        return ((this.fullName) ? this.subjectName : this.subjectName[0]) + this.suffix;
    };
    return MultipleSubject;
}(Subject));
var SubjectList = /** @class */ (function (_super) {
    __extends(SubjectList, _super);
    function SubjectList(subjectName, teachers, options) {
        var _this = _super.call(this, subjectName, '') || this;
        var suffixType = (options === null || options === void 0 ? void 0 : options.suffixType) || SuffixType.NUMBER;
        var fullName = (options === null || options === void 0 ? void 0 : options.fullName) || false;
        teachers.map(function (teacher, index) { return new MultipleSubject(subjectName, teacher, SuffixTypes[suffixType][index], fullName); }).forEach(function (sub, idx) { return _this[idx + 1] = sub; });
        return _this;
    }
    return SubjectList;
}(Subject));
exports.SubjectList = SubjectList;
var Exams = /** @class */ (function () {
    function Exams(month, date) {
        this.subjects = [];
        this.day = new Date(new Date().getFullYear() + "/" + month + "/" + date);
    }
    Exams.prototype.setSubjects = function () {
        var subjects = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            subjects[_i] = arguments[_i];
        }
        this.subjects = subjects;
        return this;
    };
    return Exams;
}());
var Day;
(function (Day) {
    Day[Day["MONDAY"] = 0] = "MONDAY";
    Day[Day["THEUSDAY"] = 1] = "THEUSDAY";
    Day[Day["WEDNESDAY"] = 2] = "WEDNESDAY";
    Day[Day["THURSDAY"] = 3] = "THURSDAY";
    Day[Day["FIRDAY"] = 4] = "FIRDAY";
})(Day = exports.Day || (exports.Day = {}));
var SubjectGroup = /** @class */ (function () {
    function SubjectGroup() {
        var subjects = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            subjects[_i] = arguments[_i];
        }
        this.subjects = subjects;
    }
    SubjectGroup.prototype.setToRegularSchedule = function (day) {
        Setting.addSubjectsToSchedule(day, this.subjects);
    };
    SubjectGroup.prototype.setToExamSchedule = function (month, date) {
        Setting.addExams(month, date, this.subjects);
    };
    return SubjectGroup;
}());
var Setting = /** @class */ (function () {
    function Setting() {
        this.mockTests = [];
        this.subjectsByTime = [];
        this.examList = [];
        this.classTime = null;
        this.CSAT = null;
    }
    Setting.getInstance = function () {
        if (!Setting.instance)
            Setting.instance = new Setting();
        return Setting.instance;
    };
    Setting.getMoakTests = function () {
        return Setting.getInstance().mockTests;
    };
    Setting.getSubjectsByTime = function () {
        return Setting.getInstance().subjectsByTime;
    };
    Setting.getExamList = function () {
        return Setting.getInstance().examList;
    };
    Setting.getClassTime = function () {
        return Setting.getInstance().classTime;
    };
    Setting.getCSAT = function () {
        return Setting.getInstance().CSAT;
    };
    Setting.addMoakTest = function (dateFormat) {
        Setting.getInstance().mockTests.push(new Date(dateFormat));
    };
    Setting.group = function () {
        var subjects = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            subjects[_i] = arguments[_i];
        }
        return new (SubjectGroup.bind.apply(SubjectGroup, __spreadArrays([void 0], subjects)))();
    };
    Setting.addSubjectsToSchedule = function (day, subjects) {
        Setting.getInstance().subjectsByTime[day] = subjects;
    };
    Setting.addExams = function (month, date, subjects) {
        var _a;
        Setting.getInstance().examList.push((_a = new Exams(month, date)).setSubjects.apply(_a, subjects));
    };
    Setting.setClassTime = function (classTime) {
        Setting.getInstance().classTime = classTime;
    };
    Setting.setCSAT = function (csatDay) {
        Setting.getInstance().CSAT = new Date(csatDay);
    };
    return Setting;
}());
exports.Setting = Setting;
exports.SelfStudy = Symbol('selfStudy');
var timeTable_js_1 = require("./timeTable.js");
exports.loadPage = timeTable_js_1.load;
