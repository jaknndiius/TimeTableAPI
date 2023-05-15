export class ClassTimeList {
    constructor(start, end, maxClass) {
        this.maxClass = maxClass;
        this.classTimes = { start, end, other: [] };
    }
    getDuration(previousTime, currentTime) {
        return (currentTime[0] - previousTime[0]) * 60 + currentTime[1] - previousTime[1];
    }
    checkAllIn() {
        return this.classTimes.other.length == this.maxClass;
    }
    checkOrder() {
        return this.get().map(time => time[2]).every(duration => duration >= 0);
    }
    addClassTime(hours, minutes) {
        if (this.classTimes.other.length < this.maxClass)
            this.classTimes.other.push([hours, minutes]);
        else
            throw new Error('ClassTime is already max length.');
        if (!this.checkOrder())
            throw new Error('Invalid class time order. Class times should be in chronological order.');
    }
    getElapsedTime(fromHour, fromMinute, toHour, toMinute) {
        return ((toHour - fromHour) * 60) + toMinute - fromMinute;
    }
    get() {
        const times = [];
        const durations = [];
        times.push([...this.classTimes.start]);
        for (const time of Object.values(this.classTimes.other)) {
            const prev = times[times.length - 1];
            durations.push(this.getDuration(prev, time));
            times.push([...time]);
        }
        durations.push(this.getDuration(times[times.length - 1], this.classTimes.end));
        durations.push(0);
        times.push([...this.classTimes.end]);
        for (let i = 0; i < times.length; i++) {
            times[i].push(durations[i]);
        }
        return times;
    }
    getCurrent(hours, minutes) {
        let returnIndex = -1;
        this.get().forEach(([startHour, startMinutes, duration], index) => {
            const pre = this.getElapsedTime(startHour, startMinutes, hours, minutes);
            if (pre >= 0 && pre < duration)
                returnIndex = index;
        });
        return returnIndex;
    }
    getCurrentClass({ hours, minutes }) {
        if (!this.checkAllIn())
            throw new Error(`ClassTime's length must be maxClass(${this.maxClass})`);
        const idx = this.getCurrent(hours, minutes);
        return (idx == 0) ? 1 : idx;
    }
}
export class ExamAttribute {
    constructor(selective, descriptive) {
        this.ranges = [];
        this.selective = selective;
        this.descriptive = descriptive;
    }
    addRange(range) {
        this.ranges.push(range);
        return this;
    }
}
export class Subject {
    constructor(subjectName, teacher) {
        this.examAttribute = null;
        this.subjectName = subjectName;
        this.teacher = teacher;
    }
    toString() {
        return this.subjectName;
    }
    setExam(examAttribute) {
        this.examAttribute = examAttribute;
    }
}
export const SuffixType = {
    NUMBER: [1, 2, 3, 4, 5],
    ALPABET: ['A', 'B', 'C', 'D', 'E'],
    ROMAN: ['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ']
};
class MultipleSubject extends Subject {
    constructor(subjectName, teacher, suffix, fullName) {
        super(subjectName, teacher);
        this.suffix = suffix;
        this.fullName = fullName;
    }
    toString() {
        return ((this.fullName) ? this.subjectName : this.subjectName[0]) + this.suffix;
    }
}
export class SubjectList extends Subject {
    constructor(subjectName, teachers, options) {
        super(subjectName, '');
        const suffixType = (options === null || options === void 0 ? void 0 : options.suffixType) || SuffixType.NUMBER;
        const fullName = (options === null || options === void 0 ? void 0 : options.fullName) || false;
        teachers.map((teacher, index) => new MultipleSubject(subjectName, teacher, suffixType[index], fullName)).forEach((sub, idx) => this[idx + 1] = sub);
    }
}
class Exams {
    constructor(month, date) {
        this.subjects = [];
        this.day = new Date(`${new Date().getFullYear()}/${month}/${date}`);
    }
    setSubjects(...subjects) {
        this.subjects = subjects;
        return this;
    }
}
export var Day;
(function (Day) {
    Day[Day["MONDAY"] = 0] = "MONDAY";
    Day[Day["THEUSDAY"] = 1] = "THEUSDAY";
    Day[Day["WEDNESDAY"] = 2] = "WEDNESDAY";
    Day[Day["THURSDAY"] = 3] = "THURSDAY";
    Day[Day["FIRDAY"] = 4] = "FIRDAY";
})(Day || (Day = {}));
class SubjectGroup {
    constructor(...subjects) {
        this.subjects = subjects;
    }
    setToRegularSchedule(day) {
        Setting.addSubjectsToSchedule(day, this.subjects);
    }
    setToExamSchedule(month, date) {
        Setting.addExams(month, date, this.subjects);
    }
}
export class Setting {
    constructor() {
        this.mockTests = [];
        this.subjectsByTime = [];
        this.examList = [];
        this.classTime = null;
        this.CSAT = null;
    }
    static getInstance() {
        if (!Setting.instance)
            Setting.instance = new Setting();
        return Setting.instance;
    }
    static getMoakTests() {
        return Setting.getInstance().mockTests;
    }
    static getSubjectsByTime() {
        return Setting.getInstance().subjectsByTime;
    }
    static getExamList() {
        return Setting.getInstance().examList;
    }
    static getClassTime() {
        return Setting.getInstance().classTime;
    }
    static getCSAT() {
        return Setting.getInstance().CSAT;
    }
    static addMoakTest(dateFormat) {
        Setting.getInstance().mockTests.push(new Date(dateFormat));
    }
    static group(...subjects) {
        return new SubjectGroup(...subjects);
    }
    static addSubjectsToSchedule(day, subjects) {
        Setting.getInstance().subjectsByTime[day] = subjects;
    }
    static addExams(month, date, subjects) {
        Setting.getInstance().examList.push(new Exams(month, date)
            .setSubjects(...subjects));
    }
    static setClassTime(classTime) {
        Setting.getInstance().classTime = classTime;
    }
    static setCSAT(csatDay) {
        Setting.getInstance().CSAT = new Date(csatDay);
    }
}
export const SelfStudy = Symbol('selfStudy');
import { load } from './timeTable.js';
export const loadPage = load;
