
//文字（String）を時間（Date）に変えて計算し、また文字に戻す
export const addMinutesToTime = (timeStr:string,minutesToAdd:number) => {
  const [hours,mins] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours,mins + minutesToAdd,0);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`.slice(0,5);
};

/**
 * 時間（HH:mm）を「5:00からの経過分数」に変換
 */
export const getMinutesFromStart = (timeStr: string) => {
  if (!timeStr) return 0;

  const cleanTime = timeStr.slice(0, 5);
  const [h, m] = cleanTime.split(':').map(Number);
  // 5:00を0分（スタート地点）とする
  return (h * 60 + m) - (5 * 60); 
};



/**
 * 同じ従業員の連続する同じ業務を1つに結合する
 */
export const mergeContinuousShifts = (empShifts: any[] ) => {
  if (empShifts.length === 0) return [];

  // 開始時間順に並べ替え
  const sorted = [...empShifts].sort((a, b) => 
    (a.start_time || "").localeCompare(b.start_time || "")
  );

  const merged = [];
  let current = { ...sorted[0],ids:[sorted[0].id] };

  for (let i = 1; i < sorted.length; i++) {
    const next = sorted[i];
    
    const currentName = current.業務?.name;
    const nextName = next.業務?.name;

    const isSameTask = currentName === nextName;
    // 秒数（:00）を無視して比較する
    const isContinuous = current.end_time?.slice(0, 5) === next.start_time?.slice(0, 5);
    
    // 同じ業務、かつ「前が終わる時間 ＝ 次が始まる時間」なら合体
    if (isSameTask && isContinuous) {
      current.end_time = next.end_time;
      current.ids.push(next.id);
    } else {
      merged.push(current);
      current = { ...next,ids:[next.id] };
    }  
  }
  merged.push(current);
  return merged;
};



export const applyBulldozer = (state: any[], updated: any) => {
  const { ids, worker_id, date,  task_id } = updated;
  const myIdsStr = ids.map(String);
  const originalShift = state.find(s => ids.includes(s.id));//更新前の元データ

  const start_time = updated.start_time.slice(0,5);
  const end_time = updated.end_time.slice(0,5);

  // 1. 関係ない人・別の日を分ける（保護）
  const otherShifts = state.filter(s =>  String(s.worker_id) !== String(worker_id) || s.date !== date);
  const targetDayShifts = state.filter(s => String(s.worker_id) === String(worker_id) && s.date === date);
  
  // 2. 当事者の日のブルドーザー実行
  const processed = targetDayShifts
    .filter(s => {
      if (myIdsStr.includes(String(s.id))) return false; // 自分を消す
      const sStart = s.start_time.slice(0, 5);
      const sEnd = s.end_time.slice(0, 5);
      if (sStart >= start_time && sEnd <= end_time) return false; // 飲み込まれる隣人を消す
      return true;
    })
    .map(s => {
      const sStart = s.start_time.slice(0, 5);
      const sEnd = s.end_time.slice(0, 5);
      if (sStart <= start_time && sEnd >= end_time) return {...s,end_time:start_time};
      // 左側の重なりをカット
      if (sEnd >= start_time && sStart <= start_time) return { ...s, end_time: start_time };
      // 右側の重なりをカット
      if (sStart <= end_time && sEnd>= end_time) return { ...s, start_time: end_time };
      
      return s;
    });

  // 3. 新しい 1 本を合成
  const newBar = {
    ...originalShift,//更新前データ
    ...updated,//更新されるデータ
    id: ids[0], // 代表IDを維持
    ids: [ids[0]], // 合体解除して1本にする
    start_time,
    end_time,
    task_id,
    
  };

  return [...otherShifts, ...processed, newBar];
};


export const getShiftRange = (localShifts:any,staffId: string) => {
    
    if(!localShifts) return null;
    const staffShifts = localShifts.filter((s:any) => String(s.worker_id) === staffId);
    if (staffShifts.length === 0) return null;
    // 開始時間と終了時間をすべて集めてソート
    const startTimes = staffShifts.map((s:any) => s.start_time).sort();
    const endTimes = staffShifts.map((s:any) => s.end_time).sort();

    // 最初と最後を抽出（例: 09:00:00 -> 09:00）
    const minStart = startTimes[0]?.slice(0, 5) || "--:--";
    const maxEnd = endTimes[endTimes.length - 1]?.slice(0, 5) || "--:--";

    return `${minStart}—${maxEnd}`;

};


//日労働時間の計算
export const calculateTotalHoursDay = (localShifts:any,staffId:string) => {
    const staffShifts = localShifts.filter((s:any) => String(s.worker_id) === staffId);

    let totalMinutes = 0;
    staffShifts.forEach((s:any) => {
        if(!s.start_time || !s.end_time || s.task_id === 3) return;

        // "09:00:00" -> [9, 0, 0] に分解
        const [sh,sm] = s.start_time.split(':').map(Number);
        const [eh, em] = s.end_time.split(':').map(Number);

        totalMinutes += (eh * 60 + em) - (sh * 60 + sm);
    });
    return parseFloat((totalMinutes / 60).toFixed(2)).toString();
  };


export const getShiftBounds = (shifts:any[]) => {
    if(shifts.length === 0) return null;

    const minStart = shifts.reduce((min,s) => (s.start_time < min ? s.start_time : min),shifts[0].start_time);
    const maxEnd = shifts.reduce((max, s) => (s.end_time > max ? s.end_time : max), shifts[0].end_time);

    return {
        minStart:minStart,
        maxEnd:maxEnd
    };
};

// utils.ts などの共通ファイルに
export const getMonthlyRange = (targetDateStr: any) => {
  const date = new Date(targetDateStr);
  const year = date.getFullYear();
  const month = date.getMonth(); // 0:1月, 1:2月...
  const day = date.getDate();

  let startDate, endDate;

  if (day <= 20) {
    // 20日以前なら：先月21日 〜 今月20日
    startDate = new Date(year, month - 1, 21);
    endDate = new Date(year, month, 20);
  } else {
    // 21日以降なら：今月21日 〜 来月20日
    startDate = new Date(year, month, 21);
    endDate = new Date(year, month + 1, 20);
  }

  // YYYY-MM-DD 形式の文字列で返す
  const toJSTISO = (d: Date) => d.toLocaleDateString('sv-SE');

  return {
    start: toJSTISO(startDate),
    end: toJSTISO(endDate)
  };
};






  






