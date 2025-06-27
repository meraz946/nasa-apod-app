//NASA API KEY
const apiKey ='eJoBFZ2u25OimMj8sEvpOab2y5gX292dwrCqmHO6'; 
const dateInput = document.getElementById('date-input'); // 日付入力フォームの要素を取得（Get the date input element）
const form = document.getElementById('date-form'); // フォーム要素を取得（Get the form element）
const titleEl = document.getElementById('title'); // タイトル表示要素を取得（Get the title element）
const imageEl = document.getElementById('image'); // 画像表示要素を取得（Get the image element）
const descEl = document.getElementById('desc'); // 説明文表示要素を取得（Get the description element）

// 今日の日付を max に設定（Set today's date as the max value for input）
const today = new Date().toISOString().split('T')[0]; // 今日の日付を"YYYY-MM-DD"形式で取得（Get today's date in YYYY-MM-DD format）
dateInput.max = today; // 日付入力の最大値を今日に設定（Limit the input date to today）

// 初期表示（今日）→ ページ読み込み時に今日のAPODを表示（Initial load shows today's APOD）
fetchAPOD(today); // APIから今日のデータを取得（Fetch today's APOD data）

// 日付選択で取得（Handle form submission on date select）
form.addEventListener('submit', (e) => { // フォームのsubmitイベントを処理（Handle form submit event）
  e.preventDefault(); // デフォルトの送信動作をキャンセル（Prevent default form behavior）
  const date = dateInput.value; // 入力された日付を取得（Get the selected date）
  if (date) { // 日付が入力されていれば（If date is provided）
    fetchAPOD(date); // その日付でAPODを取得（Fetch APOD for the selected date）
  }
});

async function fetchAPOD(date) { // 指定された日付のAPODを非同期で取得（Asynchronously fetch APOD for given date）
  const cacheKey = `apod-${date}`; // キャッシュ用キーを生成（Create cache key）
  const cached = localStorage.getItem(cacheKey); // localStorageからキャッシュを取得（Try to get cached data from localStorage）

  if (cached) { // キャッシュが存在する場合（If cached data exists）
    const data = JSON.parse(cached); // JSON文字列をオブジェクトに変換（Parse the cached JSON string）
    renderAPOD(data, true); // 表示処理（キャッシュからの読み込みを示す）（Render with cache flag）
    return; // 処理終了（Return early if cached）
  }

  titleEl.textContent = 'タイトルを読み込み中...'; // タイトル読み込み中メッセージ（Show loading message for title）
  descEl.textContent = '説明文を読み込み中...'; // 説明文読み込み中メッセージ（Show loading message for description）
  imageEl.src = ''; // 画像のURLを一旦リセット（Clear image source）
  imageEl.alt = ''; // alt属性もリセット（Clear image alt text）

  const url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&date=${date}`; // APIエンドポイントを構築（Build API URL）

  try {
    const res = await fetch(url); // APIに非同期リクエスト（Fetch the APOD data asynchronously）
    if (!res.ok) { // レスポンスが正常でない場合（If HTTP status is not OK）
      throw new Error(`HTTPエラー: ${res.status}`); // エラーをスロー（Throw error with status code）
    }

    const data = await res.json(); // JSONデータを取得（Parse the response as JSON）
    localStorage.setItem(cacheKey, JSON.stringify(data)); // 結果をキャッシュに保存（Cache the result in localStorage）
    renderAPOD(data, false); // 通常のレンダリング（キャッシュなし）（Render the data normally）
  } catch (err) { // エラー処理（Catch any errors during fetch）
    titleEl.textContent = '取得に失敗しました'; // タイトルにエラーメッセージ表示（Show error title）
    descEl.textContent = `エラー: ${err.message}`; // 説明文に詳細エラー表示（Show error message）
    imageEl.style.display = 'none'; // 画像は非表示（Hide the image）
  }
}

function renderAPOD(data, fromCache) { // APODの内容をDOMに反映（Render APOD data to the page）
  titleEl.textContent = `${data.title}${fromCache ? '（キャッシュ）' : ''}`; // タイトルにキャッシュ表示を追加（Show title with cache tag if applicable）
  descEl.textContent = data.explanation; // 説明文を表示（Display explanation text）

  if (data.media_type === 'image') { // 画像タイプなら（If media is image）
    imageEl.src = data.url; // 画像URLをセット（Set image source）
    imageEl.alt = data.title; // alt属性にタイトルをセット（Set image alt text）
    imageEl.style.display = 'block'; // 画像を表示（Make image visible）
  } else { // 画像でない（動画など）の場合（If not an image）
    imageEl.style.display = 'none'; // 画像を非表示（Hide image element）
    descEl.textContent += '（※この日は画像ではなく動画です）'; // 説明文に補足を追加（Append note about non-image media）
  }
}