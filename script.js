const {ref, computed, onMounted ,createApp} = Vue;

// Vuetify を取り出し
const { createVuetify } = Vuetify;
const vuetify = createVuetify();

createApp({
  setup() {
    // Vue内部で使いたい変数は全て ref で定義する
    //console.log("setup開始");
    const mountains = ref([]);
    //console.log("1");
    const selectedArea = ref('');
    //console.log("2");
    const favoriteMountain = ref([]);
    const tab=ref('mountains');
    const areaItems = ref({
      北海道: [
        {
          title: '北海道',
          id: 1
        }
      ],

      東北: [
        {
          title: '青森県',
          id: 2
        },
        {
          title: '岩手県',
          id: 3
        },
        {
          title: '宮城県',
          id: 4
        },
        {
          title: '秋田県',
          id: 5
        },
        {
          title: '山形県',
          id: 6
        },
        {
          title: '福島県',
          id: 7
        }
      ],
      北陸:[
        { title: '新潟県', id: 15 },
        { title: '富山県', id: 16 },   
        { title: '石川県', id: 17 },   
        { title: '福井県', id: 18 }
      ],
      関東・甲信越:[ { title: '茨城県', id: 8 },
              { title: '栃木県', id: 9 },    
              { title: '群馬県', id: 10 },   
              { title: '埼玉県', id: 11 },   
              { title: '千葉県', id: 12 },   
              { title: '東京都', id: 13 },  
              { title: '神奈川県', id: 14 },  
              { title: '山梨県', id: 19 },   
              { title: '長野県', id: 20 } 
             ],
      東海: [ { title: '岐阜県', id: 21 },  
           { title: '静岡県', id: 22 },   
           { title: '愛知県', id: 23 }  
          ],
      近畿: [   { title: '三重県', id: 24 },   
           { title: '滋賀県', id: 25 }, 
           { title: '京都府', id: 26 },  
           { title: '大阪府', id: 27 }, 
           { title: '兵庫県', id: 28 },  
           { title: '奈良県', id: 29 }, 
           { title: '和歌山県', id: 30 } 
          ],
      中国: [ { title: '鳥取県', id: 31 },
           { title: '島根県', id: 32 },
           { title: '岡山県', id: 33 },
           { title: '広島県', id: 34 },
           { title: '山口県', id: 35 }
          ],
      四国: [{ title: '徳島県', id: 36 },
           { title: '香川県', id: 37 },
           { title: '愛媛県', id: 38 },
           { title: '高知県', id: 39 }
          ],
      九州・沖縄: [{ title: '福岡県', id: 40 },
              { title: '佐賀県', id: 41 },
              { title: '長崎県', id: 42 },
              { title: '熊本県', id: 43 },
              { title: '大分県', id: 44 },
              { title: '宮崎県', id: 45 },
              { title: '鹿児島県', id: 46 },
              { title: '沖縄県', id: 47 }]
    });
    const currentPrefectures = computed(() => {
      return areaItems.value[selectedArea.value] || [];});  
    const selectedPrefecture = ref('');
    const loading = ref(false);

    function selectPrefecture(pref){
      selectedPrefecture.value = pref.title;
      loadMountains(pref.id);
    }

    // 山の情報を保持する
    function getMountainRank(
      temp,wind,rain){
      if(rain ===0 && wind < 5 &&temp>=5){
        return "A";
      }
      if(rain<1 && wind < 10 && temp >=0){
        return "B";
      }
      return "C";
    }

    function favoriteM(mountain){
      const exists = favoriteMountain.value.some(
          item => item.name === mountain.name);
      if (!exists) {
      favoriteMountain.value.push(mountain);
      alert("お気に入りに追加しました。");
      }
      
    }

    function deleteFavorite(index) {
      favoriteMountain.value.splice(index,1)
      ;
      console.log("消しました");
    }

    async function loadMountains(prefectureId) {
      //console.log("loadMountains開始");
      loading.value = true;
      const result = [];
      try{
        const res = await axios.get
        (`https://mountix.codemountains.org/api/v1/mountains?tag=1&prefecture=${prefectureId}`);

        console.log(res.data.mountains.length);
        const data = res.data;
        //console.log(res.data.mountains);
        //console.log(mountains)

        for(const mountain of res.data.mountains){
          //console.log("for文", mountain.name);

          const weather = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${mountain.location.latitude}&longitude=${mountain.location.longitude}&current=temperature_2m,precipitation,wind_speed_10m`);
          //console.log(mountain.name,weather.data.current.temperature_2m);
          //console.log("4.天気取得");
          const current = weather.data.current;

          result.push(
            {name:mountain.name,
             prefecture:mountain.prefectures,
             elevation:mountain.elevation,
             temperature:current.temperature_2m,
             wind: current.wind_speed_10m,
             rain: current.precipitation,
             rank: getMountainRank(
               current.temperature_2m,
               current.wind_speed_10m,
               current.precipitation,
             )
            });
          //console.log("6.push成功");
        }
        mountains.value = result;
      }finally{ //console.log(result);
        loading.value = false; //console.log(mountains.value);
      }


    }
    onMounted(()=>{
      console.log("mounted");
    });

    return{
      tab,
      loading,
      currentPrefectures,
      mountains,
      selectedArea,
      areaItems,
      selectedPrefecture,
      selectPrefecture,
      favoriteM,
      favoriteMountain,
      deleteFavorite
    };

  }
})
  .use(vuetify)
  .mount('#app');