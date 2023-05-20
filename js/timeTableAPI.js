export class ClassTimeList {
    /**
     * **교시 별 시간 설정 객체를 생성합니다**
     *
     * @constructor
     * @param {number[]} start *등교 시간: [hours, minutes]*
     * @param {number[]} end *하교 시간: [hours, minutes]*
     * @param {number} maxClass *교시 수*
     */
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
    /**
     * **교시 시작 시간을 추가합니다**
     *
     * @param {number} hours
     * @param {number} minutes
     */
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
    /**
     * **시험 정보 객체를 생성합니다**
     *
     * @constructor
     * @param {number} selective *선택형 문항 갯수*
     * @param {number} descriptive *서술형 문항 갯수*
     */
    constructor(selective, descriptive) {
        this.ranges = [];
        this.selective = selective;
        this.descriptive = descriptive;
    }
    /**
     * **범위 설명 행을 추가합니다**
     *
     * @param {string} range
     * @returns {ExamAttribute} *ExamAttribute Instance*
     */
    addRange(range) {
        this.ranges.push(range);
        return this;
    }
}
export class Subject {
    /**
     * **과목 객체를 생성합니다**
     *
     * @constructor
     * @param {string} subjectName *과목 이름*
     * @param {string} teacher *선생님 이름*
     */
    constructor(subjectName, teacher) {
        this.examAttribute = null;
        this.subjectName = subjectName;
        this.teacher = teacher;
    }
    toString() {
        return this.subjectName;
    }
    /**
     * **과목의 시험범위를 설정합니다**
     *
     * @param {ExamAttribute} examAttribute *시험 정보*
     */
    setExam(examAttribute) {
        this.examAttribute = examAttribute;
    }
}
export var SuffixType;
(function (SuffixType) {
    SuffixType["NUMBER"] = "NUMBER";
    SuffixType["ALPABET"] = "ALPABET";
    SuffixType["ROMAN"] = "ROMAN";
})(SuffixType || (SuffixType = {}));
const SuffixTypes = {
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
export class DisplayOptions {
    /**
     * **표시 설정 객체를 생성합니다**
     *
     * @constructor
     * @param {SuffixType} [suffixType=SuffixType.NUMBER]
     * *접미사를 설정합니다*
     * - **SuffixType.NUMBER**: 기본 설정, 숫자
     * - **SuffixType.ALPABET**: 알파벳
     * - **SuffixType.ROMAN**: 로마 숫자
     * @param {boolean} [fullName=false]
     * *전체 이름 표시 여부를 설정합니다*
     * - **true**: 전체 이름 표시
     * - **false**: 기본설정, 첫 단어만 표시
     */
    constructor(suffixType = SuffixType.NUMBER, fullName = false) {
        this._suffixType = suffixType;
        this.fullName = fullName;
    }
    get suffixType() {
        return SuffixTypes[this._suffixType];
    }
}
export class SubjectList extends Subject {
    /**
     * **복수 과목 객체를 생성합니다**
     *
     * @constructor
     * @param {string} subjectName *과목 이름*
     * @param {string[]} teachers *선생님 이름 배열*
     * @param {(DisplayOptions | undefined)} options *표시 설정*
     */
    constructor(subjectName, teachers, options = new DisplayOptions()) {
        super(subjectName, '');
        teachers.map((teacher, index) => new MultipleSubject(subjectName, teacher, options.suffixType[index], options.fullName)).forEach((sub, idx) => this[idx + 1] = sub);
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
    /**
     * **해당 요일의 정규 시간표로 등록합니다**
     *
     * @param {Day} day
     * *요일을 설정합니다*
     * - **Day.MONDAY**: 월요일
     * - **Day.THEUSDAY**: 화요일
     * - **Day.WEDNESDAY**: 수요일
     * - **Day.THURSDAY**: 목요일
     * - **Day.FRIDAY**: 금요일
     */
    setToRegularSchedule(day) {
        Setting.addSubjectsToSchedule(day, this.subjects);
    }
    /**
     * **해당 날짜의 시험 시간표로 등록합니다**
     *
     * @param {number} month
     * @param {number} date
     */
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
    /**
     * **모의고사 날짜를 추가합니다**
     *
     * @static
     * @param {string} dateFormat *날짜 문자열('YYYY/MM/DD')*
     */
    static addMoakTest(dateFormat) {
        Setting.getInstance().mockTests.push(new Date(dateFormat));
    }
    /**
     * **수능 날짜를 설정합니다**
     *
     * @static
     * @param {string} csatDay *날짜 문자열('YYYY/MM/DD')*
     */
    static setCSAT(csatDay) {
        Setting.getInstance().CSAT = new Date(csatDay);
    }
    /**
     * **과목을 그룹화합니다**
     *
     * @static
     * @param {Subject[]} subjects
     * @returns {SubjectGroup}
     */
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
    /**
     * **교시 별 시간을 설정합니다**
     *
     * @static
     * @param {ClassTimeList} classTime *교시 별 시간 설정 객체*
     */
    static setClassTime(classTime) {
        Setting.getInstance().classTime = classTime;
    }
}
export const SelfStudy = Symbol('selfStudy');
import { load } from './timeTable.js';
export const loadPage = load;
