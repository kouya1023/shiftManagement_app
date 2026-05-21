// types/japanese-holidays.d.ts
declare module 'japanese-holidays' {
  /**
   * 指定した日付が祝日かどうかを判定します。
   * @param date 判定するDateオブジェクト
   * @param count振替休日を考慮するかどうか (デフォルト: true)
   * @returns 祝日の名前（文字列）、祝日でない場合は undefined
   */
  export function isHoliday(date: Date, includeSubstitute?: boolean): string | undefined;

  /**
   * 指定した年、または期間の祝日リストを取得します。
   */
  export function getHolidaysOf(year: number, includeSubstitute?: boolean): any[];
}