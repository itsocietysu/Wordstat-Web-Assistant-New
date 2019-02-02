
let transport = function (data, callback) {
    chrome.extension.sendMessage(data, callback);
};

let wordstatWebAssistantLoad = function ($, window, transport) {
    // Основной блок (для отслеживания изменений)
    let contentBlock = $('.b-wordstat-content');

    // Настройки
    let options = {
        // Сортировка
        order: 'abc', // abc, count
        sort: 'asc' // asc, desc
    };

    let optionsMinus = {
        // Сортировка
        order: 'abc', // abc
        sort: 'asc' // asc, desc
    };
    //Проверка существования элемента
    $.fn.exists = function () {
        return this.length !== 0;
    };
    // Множественная форма слова
    function humanPluralForm(n, titles) {
        let cases = [2, 0, 1, 1, 1, 2];
        return titles[(n % 100 > 4 && n % 100 < 20) ? 2 : cases[Math.min(n % 10, 5)]];
    }
    /*-------------------------------------------------------------------------------------------*/
    // Блок плагина
    let bodyTpl = 
    '<div class="container-fluid" id="main">' +

      '<div class="row no-gutters row-top">' +
        '<div class="col" >' +
        '<div class="action-button-div action-button-div-logo"><i class="action-button-i action-button-i-logo" title="rocont.ru"></i></div>' +
        '<div class="action-button-div" id="action-button-div-range"><i class="action-button-i" id="action-button-i-range" title="Задать частотность"></i></div>' +
        '<div class="action-button-div" id="action-button-div-export"><i class="action-button-i" id="action-button-i-export" title="Экспортировать в csv"></i></div>' +
        '</div>' +
      '</div>' +
      
      '<div class="row no-gutters row-key-words">' +
        '<div class="col"><span class="span-title-words">Ключевые слова</span></div>' +
      '</div>' + 
      '<div class="row no-gutters row-actions">' +
        '<div class="col">' +
        '<div class="action-button-div" id="action-button-div-add"><i class="action-button-i action-button-i-add" title="Добавить"></i></div>' +
        '<div class="action-button-div" id="action-button-div-download"><i class="action-button-i action-button-i-download" title="Загрузить список"></i></div>' +
        '<div class="action-button-div" id="action-button-div-copy"><i class="action-button-i action-button-i-copy" title="Копировать"></i></div>' +
        '<div class="action-button-div" id="action-button-div-copy-range"><i class="action-button-i action-button-i-copy-range" title="Копировать с частотностью"></i></div>' +
        '<div class="action-button-div" id="action-button-div-delete"><i class="action-button-i action-button-i-delete" title="Очистить"></i></div>' +
        '</div>' +
      '</div>' +        
      '<div class="row no-gutters" id="words-list">' +
        '<div class="col">' +
            '<ul class="list-group" id="list-group-plus">' +
            '</ul>' +
        '</div>' +
      '</div>' +  
      '<div class="row no-gutters" id="line-separation">' +
      '</div>' +
      '<div class="row no-gutters row-key-words">' +
        '<div class="col"><span class="span-title-words">Минус-слова</span></div>' +
      '</div>' +
      '<div class="row no-gutters row-actions">' +
        '<div class="col">' +
            '<div class="action-button-div" id="action-button-div-add-minus"><i class="action-button-i action-button-i-add" title="Добавить"></i></div>' +
            '<div class="action-button-div" id="action-button-div-download-minus"><i class="action-button-i action-button-i-download" title="Загрузить список"></i></div>' +
            '<div class="action-button-div" id="action-button-div-copy-minus"><i class="action-button-i action-button-i-copy" title="Копировать"></i></div>' +
            '<div class="action-button-div" id="action-button-div-delete-minus"><i class="action-button-i action-button-i-delete" title="Очистить"></i></div>' +
        '</div>' +
      '</div>' +
      '<div class="row no-gutters" id="words-list">' +
        '<div class="col">' +
            '<ul class="list-group" id="list-group-minus">' +
            '</ul>' +
        '</div>' +
      '</div>' +   
    
    '</div>';

    // Добавим wwa в начало BODY
    $('BODY').prepend(bodyTpl);


    let body = $('#main');
    let selectedSearchType = function () {
        
        let el = $('input[name=search_type]:checked');
        if (el.val() == 'history') {
            body.hide();
        } else {
            body.show();
        }
    };
    $('input[name=search_type]').change(function () {
        selectedSearchType();
    });
    selectedSearchType();

    // Всплывающие окна 
    let addFromCopyTpl = 
        '<div id="windows-wrap">' +
        '<div class="container-fluid addWindow" id="addRange">' +
          '<div class="row no-gutters row-top">' +
            '<div class="col" >' +
            '<div class="action-button-div action-button-div-logo"><i class="action-button-i action-button-i-logo" title="rocont.ru"></i></div>' +
            '<i class="cross" id="cross-options" title="Закрыть"></i>' +
            '</div>' +
          '</div>' +
          
          '<div class="row no-gutters row-key-words">' +
            '<div class="col"><span class="span-title-words">Сортировка</span></div>' +
          '</div>' +      
          '<div class="row no-gutters">' +
            '<div class="col word-add-col">' +
                '<input class="input-frequency" id="input-from" placeholder="от"><input class="input-frequency" id="input-to" placeholder="до">' +
            '</div>' +
           '</div>' +
            '<div class="row no-gutters">' +
                '<div class="col word-add-col">' +
                    '<div class="button-wrap"><b class="button-window-add" id="button-apply">Применить</b></div>' +
                '</div>' +
            '</div>' +
        '</div>' +
        '<div class="container-fluid addWindow" id="addFromCopy">' +
          '<div class="row no-gutters row-top">' +
            '<div class="col" >' +
            '<div class="action-button-div action-button-div-logo"><i class="action-button-i action-button-i-logo" title="rocont.ru"></i></div>' +
            '<i class="cross" id="cross-from-copy" title="Закрыть"></i>' +
            '</div>' +
          '</div>' +
          
          '<div class="row no-gutters row-key-words">' +
            '<div class="col"><span class="span-title-words">Ключевые слова</span></div>' +
          '</div>' +      
          '<div class="row no-gutters">' +
            '<div class="col word-add-col">' +
                '<textarea id="add-area" placeholder="Добавьте слова"></textarea>' +
            '</div>' +
           '</div>' +
            '<div class="row no-gutters">' +
                '<div class="col word-add-col">' +
                    '<div class="button-wrap"><b class="button-window-add" id="button-add">Добавить</b></div>' +
                '</div>' +
            '</div>' +
        '</div>' +

        '<div class="container-fluid addWindow" id="addFromCopyMinus">' +
          '<div class="row no-gutters row-top">' +
            '<div class="col" >' +
            '<div class="action-button-div action-button-div-logo"><i class="action-button-i action-button-i-logo" title="rocont.ru"></i></div>' +
            '<i class="cross" id="cross-from-copy-minus" title="Закрыть"></i>' +
            '</div>' +
          '</div>' +
          
          '<div class="row no-gutters row-key-words">' +
            '<div class="col"><span class="span-title-words">Минус-слова</span></div>' +
          '</div>' +      
          '<div class="row no-gutters">' +
            '<div class="col word-add-col">' +
                '<textarea id="add-area-minus" placeholder="Добавьте слова"></textarea>' +
            '</div>' +
           '</div>' +
            '<div class="row no-gutters">' +
                '<div class="col word-add-col">' +
                    '<div class="button-wrap"><b class="button-window-add" id="button-add-minus">Добавить</b></div>' +
                '</div>' +
            '</div>' +
        '</div>' +
        '</div>';

    $('BODY').prepend(addFromCopyTpl);
    //Уведомления
    let showNotificationTpl =
    '<div class="container-fluid notification">' +
        '<div class="row no-gutters row-top">' +
            '<div class="col" >' +
            '<div class="action-button-div action-button-div-logo"><i class="action-button-i action-button-i-logo" title="rocont.ru"></i></div>' +
            '<i class="cross" id="cross-small" title="Закрыть"></i>' +
            '</div>' +
          '</div>' +
        '<div class="row no-gutters">' +
            '<div class="col" id="colToAdd"></div>' +   
        '</div>' +
    '</div>';

     $('BODY').prepend(showNotificationTpl);

/*-------------------------------------------------------------------------------------------*/
    // Шаблон элемента списка слов
    let itemTpl = '<li><div class="li-wrap"><span class="word-span">{word}</span> <span>({count})</span></div><div class="words-del-div"><i class="words-del" title="Удалить из списка"></i></div></li>';
    // Шаблон элемента списка минус-слов
    let itemTplMinus = '<li><span>{word}</span><div class="words-del-div"><i class="words-del" title="Удалить из списка"></i></div></li>';

    
    // Nano Templates
     $.nano = function (template, data) {
        return template.replace(/\{([\w\.]*)\}/g, function (str, key) {
            let keys = key.split(".");
            let value = data[keys.shift()];
            $.each(keys, function () {
                value = value[this];
            });
            return (value === null || value === undefined) ? "" : value;
        });
    };

    // Подстановка в шаблон для минус-слов
    $.nanoMinus = function (template, data) {
        return template.replace(/\{([\w\.]*)\}/g, data.word);
    };

    // Добавление пробелов в числе между разрядами
    function numberSpaces(number) {
        return number.toString().replace(/(?=\B(?:\d{3})+\b)/g, '&nbsp;');
    }
/*-------------------------------------------------------------------------------------------*/
   // Лог
    let log = {
        // Таймер
        timer: undefined,

        // Уведомление
        show: function (text, type) {
            let notice = '</div><p class="show-notification" id="notification-' + type + '">' + text + '</p>';   
            $('#colToAdd').html(notice);
            
            $('.notification').stop(true, true).show();
            $('#cross-small').click(function() {
                $('.notification').hide();
            });
            clearTimeout(log.timer);
            log.timer = setTimeout(function () {
                $('.notification').fadeOut(300);
            }, 2500);
        }

    };
/*-------------------------------------------------------------------------------------------*/


    // Хранилище
    let storage = {

        // Сохранить
        save: function () {
            storage.saveData();
            storage.saveOptions();
        },
        // Сохранить минус-режим
        saveMinus: function () {
            storage.saveDataMinus();
            storage.saveOptionsMinus();
        },

        // Сохранить данные минус-таблицы
        saveDataMinus: function (wwaDataMinus) {

            if (!wwaDataMinus) {
                wwaDataMinus = listMinus.data;
            }

            try {
                localStorage['WordstatWebAssistantMinus'] = JSON.stringify(wwaDataMinus);
            } catch (e) {
                log.show('<b>Ошибка:</b><br/> ' + e.name, 'error');
            }
        },

        // Сохранить данные
        saveData: function (wwaData) {
            if (!wwaData) {
                wwaData = list.data;
            }
            try {
                localStorage['WordstatWebAssistant'] = JSON.stringify(wwaData);
            } catch (e) {
                log.show('<b>Ошибка:</b><br/> ' + e.name, 'error');
            }
        },

        // Сохранить настройки минус-таблицы
        saveOptionsMinus: function (wwaOptionsMinus) {
            if (!wwaOptionsMinus) {
                wwaOptionsMinus = optionsMinus;
            }
            try {
                localStorage['WordstatWebAssistantOptionsMinus'] = JSON.stringify(wwaOptionsMinus);
            } catch (e) {
                log.show('<b>Ошибка:</b><br/> ' + e.name, 'error');
            }
        },
        // Сохранить настройки
        saveOptions: function (wwaOptions) {
            if (!wwaOptions) {
                wwaOptions = options;
            }
            try {
                localStorage['WordstatWebAssistantOptions'] = JSON.stringify(wwaOptions);
            } catch (e) {
                log.show('<b>Ошибка:</b><br/> ' + e.name, 'error');
            }
        },

        // Загрузить минус-таблицу и настройки
        loadMinus: function (update) {
            storage.loadDataMinus();
            storage.loadOptionsMinus();
            if (update) {
                listMinus.update();
            }
        },
        // Загрузить
        load: function (update) {
            storage.loadData();
            storage.loadOptions();
            if (update) {
                list.update();
            }
        },

        // Загрузить данные минус-таблицы
        loadDataMinus: function () {
            let wwaDataMinus = localStorage['WordstatWebAssistantMinus'];
            if (wwaDataMinus != '' && wwaDataMinus != undefined) {
                try {
                    wwaDataMinus = JSON.parse(wwaDataMinus);
                } catch (e) {
                    log.show('<b>Ошибка:</b><br/> ' + e.name, 'error');
                }
            }

            if (!$.isArray(wwaDataMinus)) {
                wwaDataMinus = [];
                storage.saveDataMinus(wwaDataMinus);
            }
            listMinus.data = listMinus.prepareDatas(wwaDataMinus);

        },
        // Загрузить данные
        loadData: function () {
            let wwaData = localStorage['WordstatWebAssistant'];
            if (wwaData != '' && wwaData != undefined) {
                try {
                    wwaData = JSON.parse(wwaData);
                } catch (e) {
                    log.show('<b>Ошибка:</b><br/> ' + e.name, 'error');
                    
                }
            }
            if (!$.isArray(wwaData)) {
                wwaData = [];
                storage.saveData(wwaData);
            }
            list.data = list.prepareDatas(wwaData);
        },

        // Загрузить настройки минус-таблицы
        loadOptionsMinus: function () {
            let wwaOptionsMinus = localStorage['WordstatWebAssistantOptionsMinus'];
            if (wwaOptionsMinus != '' && wwaOptionsMinus != undefined) {
                try {
                    wwaOptionsMinus = JSON.parse(wwaOptionsMinus);
                } catch (e) {
                    log.show('<b>Ошибка:</b><br/> ' + e.name, 'error');
                   
                }
            }
            if (!(wwaOptionsMinus && ('order' in wwaOptionsMinus) && ('sort' in wwaOptionsMinus))) {
                wwaOptionsMinus = optionsMinus;
                storage.saveOptionsMinus(wwaOptionsMinus);
            }
            optionsMinus = wwaOptionsMinus;
        },
        // Загрузить настройки
        loadOptions: function () {
            let wwaOptions = localStorage['WordstatWebAssistantOptions'];
            if (wwaOptions != '' && wwaOptions != undefined) {
                try {
                    wwaOptions = JSON.parse(wwaOptions);
                } catch (e) {
                    log.show('<b>Ошибка:</b><br/> ' + e.name, 'error');
                    
                }
            }
            if (!(wwaOptions && ('order' in wwaOptions) && ('sort' in wwaOptions))) {
                wwaOptions = options;
                storage.saveOptions(wwaOptions);
            }
            options = wwaOptions;
        }

    };
/*-------------------------------------------------------------------------------------------*/
    //Действия со списком слов
    let list = {

        // Данные
        data: [],

        //Обновить
        update: function () {
            let html = '';
            let listData = list.data.slice(0);

            for (let i = 0; i < listData.length; ++i) {
                let w = listData[i].word;
                let c = listData[i].count > 0 ? numberSpaces(listData[i].count) : '?';
                html += $.nano(itemTpl, {word: w, count: c});
                
            }
            $('#list-group-plus').html(html);
        },

        /**
         * Возвращает отсортированные данные
         * @returns array
         */
        sortData: function () {

            // Клонируем список
            let data = list.data.slice(0);

            // Сортировка
            switch (options.order) {

                // По алфавиту
                case 'abc':
                    data.sort(function (a, b) {
                        let compA = a.word.toUpperCase();
                        let compB = b.word.toUpperCase();
                        if (compA == compB) {
                            return 0;
                        }
                        return (compA > compB) ? 1 : -1;
                    });
                    break;

                // По частотности
                case 'count':
                    data.sort(function (a, b) {
                        let compA = a.count;
                        let compB = b.count;
                        if (compA == compB) {
                            return 0;
                        }
                        return (compA > compB) ? 1 : -1;
                    });
                    break;

            }

            // Порядок
            if (options.sort == 'desc') {
                data.reverse();
            }

            return data;
        },

         // Проверка на наличие фразы
        has: function (word) {

            // Подготовить фразу
            word = $.trim(word);
            if (word == '') {
                return false;
            }

            // Проверка на наличие
            return list.data.some(function (item) {
                return item.word == word;
            });
        },

        /**
         * Возвращает подготовленные данные
         * @returns array
         */
        prepareData: function (word, count) {

            // Подготовить фразу
            word = $.trim(word);
            if (typeof(word) != 'string' || word == '') {
                return false;
            }

            // Подготовить частотность
            count = parseInt((count + '').replace(/[^\d]/gi, ''));
            if (isNaN(count)) {
                count = 0;
            }

            return {
                word: word,
                count: count
            };

        },

        /**
         * Возвращает подготовленные данные массива
         * @returns array
         */
        prepareDatas: function (listWord) {

            let result = [];
            if ($.isArray(listWord)) {
                for (let i = 0; i < listWord.length; ++i) {
                    if (typeof(listWord[i]) == 'object') {
                        let data = list.prepareData(
                            listWord[i].word ? listWord[i].word : '',
                            listWord[i].count ? listWord[i].count : 0
                        );
                        if (data) {
                            result.push(data);
                        }
                    } else if (typeof(listWord[i]) == 'string') {
                        let data = list.prepareData(listWord[i], 0);
                        if (data) {
                            result.push(data);
                        }
                    }
                }
            }
            return result;
        },

        // Добавить
        add: function (word, count) {
            // Подготовим данные
            let data = list.prepareData(word, count);
            if (!data) {
                return;
            }

            // Уже есть в списке?
            if (list.has(data.word)) {
                log.show('<b>(' + data.word + ')</b> уже есть в списке', 'warning');
                return;
            }


            // Добавить фразу в список
            list.data.unshift(data);

            // Обновить и сохранить
            list.update();
            storage.save();

        },

        // Удалить фразу
        remove: function (word) {
           
            // Подготовить фразу
            word = $.trim(word);
            if (word == '') {
                return;
            }

            // Удалить
            list.data = list.data.filter(function (item) {
                return item.word != word;
            });

            observerAdd.disconnect();
            $('.new-search').each(function() {
                if($(this).parent().prev().text() == word) { 
                    $(this).prev().find('.plus-button').show();
                    $(this).prev().find('.minus-button').hide();
                    $(this).css("color", "#1a3dc1");
                    return;
                }
            });

            markMinus();
            // Обновить и сохранить
            list.update();
            storage.save();

            // Сообщение
            //log.show('<b>' + word + '</b><br/> удалено из списка', 'info');
        },

        // Очистить 
        clear: function () {
            if (confirm('Вы действительно хотите очистить список слов?')) {
                // Очистить
                list.data = [];

                $('.new-search').each(function() {
                        $(this).prev().find('.plus-button').show();
                        $(this).prev().find('.minus-button').hide();
                        $(this).css("color", "#1a3dc1");
                });
                markMinus();


                // Сохранить и обновить
                list.update();
                storage.save();

                // Сообщение
                //log.show('Список очищен', 'info');
            }
        },

        // Копировать
        copy: function (withCount) {

            // А есть что копировать?
            if (list.data.length == 0) {
                log.show('Нет слов для копирования', 'warning');
                return;
            }

            // Подготовим текст
            let text = '',
                listData = list.sortData();
            $.each(listData, function (i, item) {
                if (text != '')
                    text += '\n';
                text += item.word + (withCount ? '\t' + item.count : '');
            });

            // Копируем
            let config = {
                action: 'copy',
                text: text
            };
            transport(config, function (response) {
                if (response.result) {
                    log.show('<b>Список скопирован в буфер обмена</b>', 'success');
                } else {
                    log.show('<b>Ошибка:</b><br/>Не удалось скопировать список в буфер обмена', 'error');
                }
            });

        },
    };
/*-------------------------------------------------------------------------------------------*/
   let mark = function() {
        markPlus();
        markMinus();
    };

    let markPlus = function() {
        observerAdd.disconnect();
        $('.new-search').each(function () {
            if(list.has($(this).text())) {
                $(this).css("color", "#8B93A6");
            }
        });
        doObserverAdd();
    };

    let markMinus = function() {
        observerAdd.disconnect();
        $('.word-parsed').css("background-color", "transparent");
        for(let i = 0; i < listMinus.data.length; i++) {
            $('.new-search').each(function() {
                let keyWord = $(this).parent().prev().text();
                keyWord = keyWord + ' ';
                let minusWordSplitted = listMinus.data[i].split(' ');
                let isContain = true;
                for(let j = 0; j < minusWordSplitted.length; j++) {
                    if(!(keyWord.indexOf(minusWordSplitted[j] + ' ') + 1)) {
                        isContain = false;
                        break;
                    }
                }
                if(isContain) {
                    $(this).prev().find('.minus-button').show();
                    $(this).prev().find('.plus-button').hide();
                    $(this).css("color", "#8B93A6")
                    $(this).find('SPAN').each(function () {
                        for(let j = 0; j < minusWordSplitted.length; j++) {   
                            if($(this).text() == minusWordSplitted[j]) {
                                $(this).css("background-color", "#fad8d9");
                            }
                        }
                    });
                }
                
            });
        }
        doObserverAdd();
    };

    let writeMinusToSearch = function() {
        observerAdd.disconnect();
        let input = $('.b-form-input__input').val();
        for(let i = 0; i < listMinus.data.length; i++) {
            let dataWithMinus = '-' + listMinus.data[i];
            if(!(input.indexOf(dataWithMinus) + 1)) {
                input += ' ' + dataWithMinus;
            }
        }
        
        $('.b-form-input__input').val(input);
        doObserverAdd();
    };
    $('.b-form-button__input').click(function() {
        writeMinusToSearch();
    });
    /*---------------------------------------------------------------------------------------*/
    
   // Действия со списком минус-слов
    let listMinus = {

        // Данные
        data: [],

        update: function () {
            let html = '';
            let listData = listMinus.data.slice(0);

            for (let i = 0; i < listData.length; ++i) {
                let w = listData[i];
                html += $.nanoMinus(itemTplMinus, {word: w});
                
            }
            $('#list-group-minus').html(html);
        },

        /**
         * Возвращает отсортированные данные
         * @returns array
         */
        sortData: function () {

            // Клонируем список
            let data = listMinus.data.slice(0);

            // Сортировка
            switch (optionsMinus.order) {

                // По алфавиту
                case 'abc':
                    data.sort(function (a, b) {
                        let compA = a.toUpperCase();
                        let compB = b.toUpperCase();
                        if (compA == compB) {
                            return 0;
                        }
                        return (compA > compB) ? 1 : -1;
                    });
                    break;

            }

            // Порядок
            if (optionsMinus.sort == 'desc') {
                data.reverse();
            }

            // Результат
            return data;
        },

         // Проверка на наличие фразы
        has: function (word) {

            // Подготовить фразу
            word = $.trim(word);
            if (word == '') {
                return false;
            }

            // Проверка на наличие
            return listMinus.data.some(function (curWord) {
                return curWord == word;
            });
        },

        /**
         * Возвращает подготовленные данные
         * @returns array
         */
        prepareData: function (word) {

            // Подготовить фразу
            word = $.trim(word);
            if (typeof(word) != 'string' || word == '') {
                return false;
            }
            // Вернуть результат
            return word;

        },

        /**
         * Возвращает подготовленные данные массива
         * @returns array
         */
        prepareDatas: function (listWord) {

            let result = [];
            if ($.isArray(listWord)) {
                for (let i = 0; i < listWord.length; ++i) {
                    if (typeof(listWord[i]) == 'object') {
                        let data = listMinus.prepareData(
                            listWord[i] ? listWord[i] : '',
                        );
                        if (data) {
                            result.push(data);
                        }
                    } else if (typeof(listWord[i]) == 'string') {
                        let data = listMinus.prepareData(listWord[i]);
                        if (data) {
                            result.push(data);
                        }
                    }
                }
            }

            // Вернуть результат
            return result;
        },

        // Добавить
        add: function (word) {
            // Подготовим данные
            let data = listMinus.prepareData(word);
            if (!data) {
                return;
            }

            // Уже есть в списке?
            if (listMinus.has(data)) {
                log.show('<b>' + data + '</b><br/> уже есть в списке', 'warning');
                return;
            }


            if(!checkInPlus(data)) {
                return;
            }

            //Добавить в строку поиска
            let input = $('.b-form-input__input').val();
            let dataWithMinus = '-' + data;
            if(!(input.indexOf(dataWithMinus) + 1)) {
                input += ' ' + dataWithMinus;
            }
            $('.b-form-input__input').val(input);

            // Добавить фразу в список
            listMinus.data.unshift(data);

            // Обновить и сохранить
            listMinus.update();
            storage.saveMinus();

            markMinus();
        },

        // Удалить фразу
        remove: function (word) {
           
            // Подготовить фразу
            word = $.trim(word);
            if (word == '') {
                return;
            }

            // Удалить
            listMinus.data = listMinus.data.filter(function (curWord) {
                return curWord != word;
            });
            let newInput ='';
            let inputSplitted = $('.b-form-input__input').val().split(' ');
            let wordSplitted = word.split(' ');
            let wordWithMinus = '-' + wordSplitted[0];
            for(let i = 0; i < inputSplitted.length; i++) {
                if(!(inputSplitted[i] == wordWithMinus)) {
                    newInput += (inputSplitted[i] + ' ');
                }
                else {
                    i += (wordSplitted.length - 1);
                }
            }
            newInput = $.trim(newInput);
            $('.b-form-input__input').val(newInput);

            // Обновить и сохранить
            listMinus.update();
            storage.saveMinus();

            observerAdd.disconnect();
            $('.new-search').each(function() {
                if(!list.has($(this).parent().prev().text())) { 
                    $(this).prev().find('.plus-button').show();
                    $(this).prev().find('.minus-button').hide();
                    $(this).css("color", "#1a3dc1");
                    $(this).find('SPAN').css("background-color", "transparent");
                }
                
            });
            markMinus();
            doObserverAdd();
            // Сообщение
            //log.show('<b>' + word + '</b><br/> удалено из списка', 'info');
        },

        clear: function () {
            if (confirm('Вы действительно хотите очистить список минус-слов?')) {
                // Удалить из строки поиска
                let newInput ='';
                let inputSplitted = $('.b-form-input__input').val().split(' ');
                let wordMinusSplitted;
                for(let i = 0; i < inputSplitted.length; i++) {
                    let isToAdd = true;
                    for(let j = 0; j < listMinus.data.length; j++) {
                        wordMinusSplitted = listMinus.data[j].split(' ');
                        let wordWithMinus = '-' + wordMinusSplitted[0];
                        if(inputSplitted[i] == wordWithMinus) {
                            isToAdd = false;
                            break;
                        }
                    }
                    if(isToAdd) {
                        newInput += (inputSplitted[i] + ' ');
                    }
                    else {
                        i += (wordMinusSplitted.length - 1);
                    }
                }
                $('.b-form-input__input').val(newInput);

                // Очистить
                listMinus.data = [];

                // Сохранить и обновить
                listMinus.update();
                storage.saveMinus();

                observerAdd.disconnect();
                $('.new-search').each(function() {
                    if(!list.has($(this).parent().prev().text())) { 
                        $(this).prev().find('.plus-button').show();
                        $(this).prev().find('.minus-button').hide();
                        $(this).css("color", "#1a3dc1");
                        $(this).find('SPAN').css("background-color", "transparent");
                    }
                    
                });
                doObserverAdd();
                // Сообщение
                //log.show('Список очищен', 'info');
            }
        },

        // Копировать
        copy: function () {

            // А есть что копировать?
            if (listMinus.data.length == 0) {
                log.show('Нет слов для копирования', 'warning');
                return;
            }

            // Подготовим текст
            let text = '',
                listData = listMinus.sortData();
            $.each(listData, function (i, item) {
                if (text != '')
                    text += '\n';
                text += item;
            });

            // Копируем
            let config = {
                action: 'copy',
                text: text
            };
            transport(config, function (response) {
                if (response.result) {
                    log.show('<b>Список скопирован в буфер обмена', 'success');
                } else {
                    log.show('<b>Ошибка:</b><br/>Не удалось скопировать список в буфер обмена', 'error');
                }
            });

        },


    };
/*-------------------------------------------------------------------------------------------*/
    // Добавление кнопок и парсинг фразы
    let addActionButtons = function () {
        observerAdd.disconnect();

        $(".b-icon_type_question").remove();

        // Кнопки добавления / удаления фраз
        let templateWordAction = '<span class="word-action-button">' +
            '<b class="minus-button" style="display: none;" title="Удалить из списка">−</b>' +
            '<b class="plus-button" style="display: none;" title="Добавить в список">+</b>' +
            '</span>';

        // Скрываем сушествующую фразу и добавляем в нужном нам формате
        $('.b-phrase-link').each(function () {
            $(this).css("display", "none");

            //Парсим по словам
            let phrase = $(this).text();
            phrase = $.trim(phrase);
            let wordsSplitted = phrase.split(' ');
            
            //Формируем html-код
            let newPhraseLink = '<span class="wwa-phrase-link">' +
                                        templateWordAction +
                                        '<a class="new-search" href="https://wordstat.yandex.ru/#!/?words=' + phrase + '" target="_self" style="text-decoration:underline;">';

            let phraseParsedHtml = '';
            let i = 0;
            for (i = 0; i < wordsSplitted.length - 1; ++i) {
                phraseParsedHtml += ('<span class="word-parsed">' + wordsSplitted[i] + '</span><b> </b>');    
            }
            phraseParsedHtml += ('<span class="word-parsed">' + wordsSplitted[i] + '</span>');

            newPhraseLink += (phraseParsedHtml + '</a></span>');
            //Добавляем код на страницу
            $(this).after(newPhraseLink);

        });

        // вывести + или - и сохранить фразу
        $('.word-action-button').each(function () {
            let phrase = $(this).next().text();
            phrase = $.trim(phrase);
            if (list.has(phrase)) {
                //$('.minus-button', this).data('phrase', phrase);
                $('.minus-button', this).show();
            } else {
                
                $('.plus-button', this).show();
            }
        });

        let input = $('.b-form-input__input').val();
        for(let i = 0; i < listMinus.data.length; i ++) {
            let wordWithMinus = '-' + listMinus.data[i];
            if(!(input.indexOf(wordWithMinus) + 1)){
                input += ' ' + wordWithMinus;
            }
        }
        $('.b-form-input__input').val(input);

        // Добавить фразу
        $('.plus-button').click(function () {
            let phrase = $(this).parent().parent().prev().text();

            let listData = list.data.slice(0);
            for (let i = 0; i < listData.length; ++i) {
                let w = listData[i].word;
                let c = listData[i].count;
                if(phrase == w && c == 0) {
                    list.remove(phrase);
                    break;
                }
            }
            list.add(
                phrase,
                $(this).parent().parent().parent().next().text()
            );
            $(this).parent().next().css("color", "#8B93A6");

            $(this).parent().find('.plus-button').hide();
            $(this).parent().find('.minus-button').show();
        });

        // Удалить фразу
        $('.minus-button').click(function () {
            let phrase = $(this).parent().parent().prev().text();
            if(list.has(phrase)) {
                list.remove(phrase);
            }
            else {
                let phraseSplitted = phrase.split(' ');
                let arrToDel = [];
                for(let i = 0; i < listMinus.data.length; i++) {
                    let minusWordSplitted = listMinus.data[i].split(' ');

                    let isContain = true;
                    for(let j = 0; j < minusWordSplitted.length; j++) {
                        let k;
                        for(k = 0; k < phraseSplitted.length; k++) {
                            if($.trim(phraseSplitted[k]) == $.trim(minusWordSplitted[j])){
                                break;
                            }
                        }
                        if(k == phraseSplitted.length) {
                            isContain = false;
                            break;
                        }
                    }
                    if(isContain) {
                        arrToDel.push(listMinus.data[i]);
                    }
                }
                for(let i = 0; i < arrToDel.length; i++) {
                    listMinus.remove(arrToDel[i]);
                }
            }

            $(this).parent().find('.plus-button').show();
            $(this).parent().find('.minus-button').hide();
        });

        //Кнопки Добавить все/удалить все
        let addAllKeyTpl = '<div addAll-wrap><b class="addAll">Добавить все</b>/<b class="delAll">Удалить все</b></div>';
        $('.b-word-statistics__table').before(addAllKeyTpl);

        $('.addAll').click(function () {
            if (confirm('Вы действительно хотите добавить в список все слова из этой таблицы?')) {
                let c = list.data.length;
                $(this).closest('.b-word-statistics__column').find('.word-action-button').each(function() {
                    let plusBut = $(this).find('.plus-button');
                    if($(plusBut).css('display') !== 'none') {
                        $(plusBut).click();
                    }
                });
                c = list.data.length - c;
                if (c > 0) {
                    log.show('<b>' + c + ' ' + humanPluralForm(c, ['слово', 'слова', 'слов']) + '</b> добавлено в список', 'success');
                } else {
                    log.show('В список не было добавлено ни одного слова', 'warning');
                }
            }
        });
        $('.delAll').click(function () {
            if (confirm('Вы действительно хотите удалить все слова из этой таблицы?')) {
                $(this).closest('.b-word-statistics__column').find('.minus-button').click();
            }
        });
        mark();
        // отслеживать
        doObserverAdd();
        if($('.ywh-body').exists()) {
             observerAdd.disconnect();
        }

    };

    //Отслеживание изменений
    let target = contentBlock.get(0);
    let observerOptions = {childList: true, subtree: true};
    let MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

    let observerAdd = new MutationObserver(addActionButtons);
    let doObserverAdd = function () {
        observerAdd.observe(target, observerOptions);
    };

    addActionButtons();
    doObserverAdd();

/*-------------------------------------------------------------------------------------------*/
    // ДЕЙСТВИЯ ПРИ КЛИКЕ НА ИКОНКИ

    // Логотип - ссылка на сайт
    $('.action-button-div-logo').click(function() {
       window.open('https://soft.rocont.ru/');
    });
    // Удаление елемента из списка
    $('#list-group-plus').on('click', '.words-del-div', function () {
        let txt = $(this).parent().find('.word-span').text();
        list.remove(txt);
        
        observerAdd.disconnect();
        $('.word-action-button').each(function () {
            let phrase = $(this).next().text();
            if(phrase == txt) {
                $(this).find('.plus-button').show();
                $(this).find('.minus-button').hide();
                return false;
            }
            
        });
        doObserverAdd();
        
    });

    // Удаление элемента из минус-списка
    $('#list-group-minus').on('click', '.words-del-div', function () {
        let txt = $(this).parent().find('SPAN').text();
        listMinus.remove(txt);
    });

    // Очистить список
    $('#action-button-div-delete').click(function () {

        list.clear();
    });

    //Очистить минус-список
    $('#action-button-div-delete-minus').click(function () {
        listMinus.clear();
    });

    // Копирование
    $('#action-button-div-copy').click(function () {
        list.copy(false);
    });
    // Копирование минус-списка
    $('#action-button-div-copy-minus').click(function () {
        listMinus.copy(false);
    }); 

     // Копирование с частотностю
     $('#action-button-div-copy-range').click(function () {
        list.copy(true);
     });
/*-------------------------------------------------------------------------------------------*/
     let readAsCsv = function(fileTobeRead) {
            let fileReader = new FileReader();
            fileReader.readAsText(fileTobeRead);
            fileReader.onloadend = function () {
                let strings = fileReader.result.split('\n');
                let firstString = strings[0].split(';');
                if(!(firstString[0].indexOf('Ключевые слова') + 1) || !(firstString[1].indexOf('Частотность') + 1) || firstString.length != 2) {
                    log.show('Неверный формат файла', 'error');
                    return;
                }
                for(let i = 1; i < strings.length - 1; i++) {
                    let stringSplitted = strings[i].split(';');
                    if(stringSplitted.length == 2) {
                        let w = $.trim(stringSplitted[0]);
                        let c = $.trim(stringSplitted[1]);
                        list.add(w, c);
                        observerAdd.disconnect();
                        $('.word-action-button').each(function () {
                            let phrase = $(this).next().text();
                            if(phrase == w) {
                                $(this).find('.minus-button').show();
                                $(this).find('.plus-button').hide();
                            }
                        });
                        doObserverAdd();
                    }
                    else {
                        log.show('Неверный формат файла', 'error');
                        return;
                    }
                }
                markPlus();
            }
    };


    let readMinusAsCsv = function(fileTobeRead) {
            let fileReader = new FileReader();
            fileReader.readAsText(fileTobeRead);
            fileReader.onloadend = function () {
                let strings = fileReader.result.split('\n');
                if(!(strings[0].indexOf('Минус-слова') + 1)) {
                    log.show('Неверный формат файла', 'warning');
                    return;
                }
                for(let i = 1; i < strings.length - 1; i++) {
                    if(strings.indexOf(';') + 1) {
                        log.show('Неверный формат файла', 'warning');
                        return;
                    }
                    let w = $.trim(strings[i]);
                    listMinus.add(w);
                }
                markMinus();
            }
    };

/*-------------------------------------------------------------------------------------------*/
     // Загрузка из csv 
    $('#action-button-div-download').click(function() {
        let uploadFile = '<input type="file" id="upload-file" />';
        $('BODY').prepend(uploadFile);
        $('#upload-file').hide();

        let fileContents = document.getElementById('upload-file');
        fileContents.click();
        fileContents.addEventListener('change', function () { 
            let fileTobeRead = fileContents.files[0];
            let fileReader = new FileReader();
            fileReader.onload = function(e) {
                let data = e.target.result;
                let workbook = XLSX.read(data, {type: 'binary'});
                try {
                    workbook = XLSX.read(data, {type: 'binary'});
                }
                catch(err) {
                    if(err.message.indexOf('CFB file size') + 1) {
                        readAsCsv(fileTobeRead);
                    }
                    else {
                        log.show('Неверынй формат файла', 'error');
                    }
                    return;
                }
                let first_sheet_name = workbook.SheetNames[0];
                /* Get worksheet */
                let worksheet = workbook.Sheets[first_sheet_name];
                let worksheetJSON = XLSX.utils.sheet_to_json(worksheet, {
                    raw: true
                });

                let keys = Object.keys(worksheetJSON[0]);

                if($.trim(keys[0]) != 'Ключевые слова' || $.trim(keys[1]) != 'Частотность') {
                    
                    log.show('Неверный формат файла', 'warning');
                    return;
                }
                for(let i = 0; i < worksheetJSON.length; i++) {
                    let w = worksheetJSON[i][keys[0]];
                    let c = worksheetJSON[i][keys[1]];
                    if(checkInMinus(w)) {
                        list.add(w, c);
                        observerAdd.disconnect();
                        $('.word-action-button').each(function () {
                            let phrase = $(this).next().text();
                            if (phrase == w) {
                                $(this).find('.minus-button').show();
                                $(this).find('.plus-button').hide();
                            }
                        });
                    }
                }
                markPlus();

            };
            fileReader.readAsBinaryString(fileTobeRead);
        });   
        $('#upload-file').remove();
    });

    // Загрузка из csv минус-слов
    $('#action-button-div-download-minus').click(function() {
        let uploadFile = '<input type="file" id="upload-file-minus" />';
        $('BODY').prepend(uploadFile);
        $('#upload-file-minus').hide();

        let fileContents = document.getElementById('upload-file-minus');
        fileContents.click();
        fileContents.addEventListener('change', function () { 
            let fileTobeRead = fileContents.files[0];
            let fileReader = new FileReader();
            fileReader.onload = function(e) {
                let data = e.target.result;
                let workbook;
                try {
                    workbook = XLSX.read(data, {type: 'binary'});
                }
                catch(err) {
                    if(err.message.indexOf('CFB file size') + 1) {
                        readMinusAsCsv(fileTobeRead);
                    }
                    else {
                        log.show('Неверынй формат файла', 'error');
                    }
                    return;
                }

                    let first_sheet_name = workbook.SheetNames[0];
                    /* Get worksheet */
                    let worksheet = workbook.Sheets[first_sheet_name];
                    let worksheetJSON = XLSX.utils.sheet_to_json(worksheet, {
                        raw: true
                    });

                    let keys = Object.keys(worksheetJSON[0]);

                    if($.trim(keys[0]) != 'Минус-слова') {
                        log.show('Неверный формат файла', 'warning');
                        return;
                    }
                    for(let i = 0; i < worksheetJSON.length; i++) {
                        let w = worksheetJSON[i][keys[0]];
                        listMinus.add(w);
                    }
                    markMinus();
            };
            fileReader.readAsBinaryString(fileTobeRead);

        });   
        $('#upload-file-minus').remove();
    });

/*-------------------------------------------------------------------------------------------------*/
    // Добавление фраз с заданной частотностью
    let c;
    function collectPromise(countFrom, countTo) {
        return new Promise((resolve, reject) => {
            setTimeout(function () {
                $('.word-parsed').ready (function() {

                    let column = $('.b-word-statistics__column').first().find('.word-action-button');
                    if(column.length == 0) {
                        setTimeout(function () {
                            window.location = 'https://wordstat.yandex.ru/#!/?page=1&words=' + $('.b-form-input__input').val();
                            c = list.data.length - c;
                            if (c > 0) {
                                log.show('<b>' + c + ' ' + humanPluralForm(c, ['слово', 'слова', 'слов']) + '</b> добавлено в список', 'success');
                            } else {
                                log.show('В список не было добавлено ни одного слова', 'warning');
                            }
                        }, 500);
                        resolve(false);
                    }
                    $(column).each(function () {

                        let plusBut = $(this).find('.plus-button');
                        if ($(plusBut).css('display') !== 'none') {

                            let tmpCount = $(this).parent().parent().next().text();
                            tmpCount = parseInt((tmpCount + '').replace(/[^\d]/gi, ''));

                            if (tmpCount >= countFrom && tmpCount <= countTo) {
                                $(plusBut).click();
                            } else if (tmpCount < countFrom) {
                                setTimeout(function () {

                                    window.location = 'https://wordstat.yandex.ru/#!/?page=1&words=' + $('.b-form-input__input').val();
                                    c = list.data.length - c;
                                    if (c > 0) {
                                        log.show('<b>' + c + ' ' + humanPluralForm(c, ['слово', 'слова', 'слов']) + '</b> добавлено в список', 'success');
                                    } else {
                                        log.show('В список не было добавлено ни одного слова', 'warning');
                                    }
                                }, 500);
                                resolve(false);
                                return false;
                            }
                        }

                    });

                    resolve(true);
                });
            }, 300);
        });
    }

    async function addFromTo(countFrom, countTo) {

        let count = 1;
        let goToNext;
        c = list.data.length;

        for(let i = 0; i < 100; i ++) {

            window.location = 'https://wordstat.yandex.ru/#!/?page=' + count + '&words=' + $('.b-form-input__input').val();
            goToNext = await collectPromise(countFrom, countTo);

            if(!goToNext) {
                break;
            }
            count++;
        }
    }

        $('#action-button-div-range').click(function () {
            $('#addRange').show();

            $(document).keydown(function(e) {
                if( e.keyCode === 27 ) {
                    $('#addRange').hide();
                    $('#input-to').val('');
                    $('#input-from').val('');
                }
            });
            $('#cross-options').click(function() {
                $('#addRange').hide();
                $('#input-to').val('');
                $('#input-from').val('');
            });
        });

        $('#button-apply').click(function () {
            $('#addRange').hide();

            let countFrom = $('#input-from').val();
            countFrom = parseInt(countFrom);
            $('#input-from').val('');

            let countTo = $('#input-to').val();
            countTo = parseInt(countTo);
            $('#input-to').val('');

            if(countFrom > countTo) {
                let tmpCount = countFrom;
                countFrom = countTo;
                countTo = tmpCount;
            }

            if(isNaN(countFrom)){
                if(isNaN(countTo)) {
                    log.show('Введите хотя бы одну границу частотности', 'warning');
                    return;
                }
                countFrom = 0;
            }
            if(isNaN(countTo)) {
                countTo = 1000000000;
            }

            addFromTo(countFrom, countTo);
                
        });
/*-------------------------------------------------------------------------------------------------*/

    const isContainFunc = function(arr1, arr2) {
        let isContain = true;
        for(let k = 0; k < arr1.length; k++)  {
            if(!(arr2.indexOf(arr1[k]) + 1)) {
                isContain = false;
                break;
            }
        }
        return isContain;
    };

    const checkInMinus = function(word) {
        let listMinusData = listMinus.data.slice(0);
            let wordSplitted = word.split(' ');
            for(let i = 0; i < listMinusData.length; i++) {
                let minusWordSplitted = listMinusData[i].split(' ');

                if(isContainFunc(minusWordSplitted, wordSplitted)) {
                    if (confirm('Фраза "' + listMinusData[i] + '" содержится в списке минус-слов. Удалить из минус-слов?')) {
                        for(let j = i; j < listMinusData.length; j++) {
                            minusWordSplitted = listMinusData[j].split(' ');

                            if(isContainFunc(minusWordSplitted, wordSplitted)) {
                                listMinus.remove(listMinusData[j]);
                            }
                        }
                        return true;
                    }
                    else {
                        return false;
                    }
                }
            }
            return true;
    };

    const checkInPlus = function(data) {
        let listData = list.data.slice(0);

        let dataSplitted = data.split(' ');
        for(let i = 0; i < listData.length; i++) {
            let plusWordSplitted = listData[i].word.split(' ');
            if(isContainFunc(dataSplitted, plusWordSplitted)) {
                if (confirm('Фраза "' + data + '" содержится в списке ключевых слов. Удалить из ключевых?')) {
                    list.remove(listData[i].word);
                    for(let j = i + 1; j < listData.length; j++) {
                        plusWordSplitted = listData[j].word.split(' ');
                        if(isContainFunc(dataSplitted, plusWordSplitted)) {
                            list.remove(listData[j].word);
                        }
                    }

                }
                else {
                    return false;
                }
                isCtrlDown = false;
                replaceLink();
                mark();
                $('body').unbind('click', bodyHandler);
                console.log("a");
                break;
            }
        }

        return true;
    };


     // Добавление фраз копированием 
     
     $('#action-button-div-add').click(function() {
        $('#addFromCopy').show();
        $(document).keydown(function(e) {
            if( e.keyCode === 27 ) {
                
                $('#addFromCopy').hide();
                $('#add-area').val('');
            }
        });
        $('#cross-from-copy').click(function() {
            
            $('#addFromCopy').hide();
            $('#add-area').val('');
        });
     });
     
     $('#action-button-div-add-minus').click(function() {
        $('#addFromCopyMinus').show();
        $(document).keydown(function(e) {
            if( e.keyCode === 27 ) {
                $('#addFromCopyMinus').hide();
                $('#add-area-minus').val('');
            }
        });
        $('#cross-from-copy-minus').click(function() {
            $('#addFromCopyMinus').hide();
            $('#add-area-minus').val('');
        });
     });
     // Добавить слова и убрать окно добавления слов
      $('#button-add').click(function() {
        
        $('#addFromCopy').hide();
        let wordsToAdd = $('#add-area').val();
        $('#add-area').val('');
        
        let wordsToAddSplitted = wordsToAdd.split('\n');
        for(let i = 0; i < wordsToAddSplitted.length; i++) {
            if(checkInMinus(wordsToAddSplitted[i])) {
                list.add(wordsToAddSplitted[i]);
            }
        }    
      });



    // Добавить слова и убрать окно добавления слов
      $('#button-add-minus').click(function() {
        $('#addFromCopyMinus').hide();
        let wordsToAdd = $('#add-area-minus').val();
        $('#add-area-minus').val('');
        
        let wordsToAddSplitted = wordsToAdd.split('\n');
        for(let i = 0; i < wordsToAddSplitted.length; i++) {
            listMinus.add(wordsToAddSplitted[i]);
        }
      });

/*-------------------------------------------------------------------------------------------*/
    // Работа с минус-режимом при нажатии ctrl

    let replaceLink = function() {
        observerAdd.disconnect();
        $('.new-search').each(function () {
            let wordChilds = $(this).children(".word-parsed");
            let phraseMinusMode = '';
            let i = 0;
            for(i = 0; i < wordChilds.length - 1; ++i) {
                phraseMinusMode += ($(wordChilds[i]).text() + ' ');
            }
            phraseMinusMode += $(wordChilds[i]).text();
            $(this).replaceWith('<a class="new-search" href="https://wordstat.yandex.ru/#!/?words=' + phraseMinusMode + '" target="_self" style="text-decoration:underline;">' + $(this).html() + '</a>');

        }); 
    };

    const bodyHandler = function(event) {
        let target = $(event.target);
        if(target.attr('class') == 'word-parsed') {
                if(!listMinus.has(target.text())) {
                    listMinus.add(target.text());
                }
                if(isCtrlDown) {
                    $('.word-parsed').each(function () {
                        if (listMinus.has($(this).text())) {
                            $(this).hover(function () {
                                $(this).css("background-color", "rgb(250, 216, 217)");
                            }, function () {
                                $(this).css("background-color", "rgb(250, 216, 217)");
                            });
                        }
                    });
                }

        }
        else if(target.css('cursor') == 'pointer') {
            isCtrlDown = false;
            replaceLink();
            mark();
            $('body').unbind('click', bodyHandler);
        }
    };
    let isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    let isCtrlDown = false;

    $(document).keyup(function (e) {
        if((!isMac && e.which == 17) || (isMac && (e.which == 91 || e.which == 93))) {

            isCtrlDown = false;
            replaceLink();
            mark();
            $('body').unbind('click', bodyHandler);
        }
    }).keydown(function (e) {
        if((!isMac && e.which == 17) || (isMac && (e.which == 91 || e.which == 93))) {
            if(isCtrlDown == true){
                return;
            }
            isCtrlDown = true;

            observerAdd.disconnect();
            $('.new-search').each(function () {  
                $(this).replaceWith('<a class="new-search">' + $(this).html() + '</a>');
            });

            $('.new-search').each(function () {  
                $(this).find('SPAN').each(function() {
                    if(!($(this).css('background-color').toLowerCase() == 'rgb(250, 216, 217)')) {
                        $(this).hover(function() {
                            $(this).css("background-color", "#c2d2ff");
                        }, function() {
                            $(this).css("background-color", "transparent");
                        });
                    }
                });
            });
            $('body').click(bodyHandler);
            mark();
        }
    });

 /*-------------------------------------------------------------------------------------------*/   
    // Выгрузка в csv

    function isLetter(c) {
        return c.toLowerCase() != c.toUpperCase();
    }

    jQuery.fn.toCSV = function(link, withCount, minusMode) {
      let $link = $(link);

      let data = $(this).first(); //Only one table

      let tmpStr = '';
      if(!withCount) {
        if(!minusMode) {
            tmpStr += 'Ключевые слова' + '\n';
        }
        else {
            tmpStr += 'Минус-слова' + '\n';
        }
        data.find('span').each(function() {
            tmpStr += ' ' + $(this).text() + '\n';
        });
      }
      else {
        if(minusMode) {
            return;
        }
        tmpStr += 'Ключевые слова; Частотность' + '\n';
        let tmpCount;
        data.find('.word-span').each(function() {

            if(!isLetter($(this).text().charAt(0))) {
                tmpStr += ' ';
            }
            tmpStr += $(this).text() + ';';
            tmpCount = $(this).next().text();
            tmpCount = tmpCount.replace(/[()]/g, '');
            tmpStr += tmpCount + '\n';
        });
      }
      let BOM = '\uFEFF';
      let output = BOM + tmpStr;


      let uri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(output);
      $link.attr("href", uri);
    };

    function saveContent(fileName, withCount, minusMode)
    {
        let link = document.createElement('a');
        link.download = fileName + '.csv';
        if(minusMode) {
            $('#list-group-minus').toCSV(link, withCount, minusMode);
        }
        else {
            $('#list-group-plus').toCSV(link, withCount, minusMode);
        }
        link.click();
    }

    $('#action-button-div-export').click(function(e) {
        let fileName = prompt('Введите имя файла для сохранения ключевых слов', 'key-words');
        if(fileName != null) {
            if($.trim(fileName) == '') {
                log.show('Неверно указано имя файла', 'warning');
            }
            else if(list.data.length == 0) {
                log.show('Нечего сохранять', 'warning');
            }
            else {
                log.show('Файл успешно загружен', 'success');
                saveContent($.trim(fileName), true, false);
            }
        }
        setTimeout(function() {
            let minusFileName = prompt('Введите имя файла для сохранения ключевых слов', 'minus-words');
            if(minusFileName != null) {
                if($.trim(minusFileName) === '') {
                    log.show('Неверно указано имя файла', 'warning');
                }
                else if(listMinus.data.length == 0) {
                    log.show('Нечего сохранять', 'warning');
                }
                else {
                    saveContent($.trim(minusFileName), false, true);
                    log.show('Файл успешно загружен', 'success');
                }
           }
        }, 100);
    });

/*-------------------------------------------------------------------------------------------*/

    // Загрузка данных и настроек 
    storage.load(true);
    /*setTimeout(function () {
        storage.load(true);
    }, 2000);*/

    storage.loadMinus(true);
    /*setTimeout(function () {
        storage.loadMinus(true);
    }, 2000);*/


 };


/*let isSubscribed;

function getProductList() {
    console.log("google.payments.inapp.getSkuDetails");
    google.payments.inapp.getPurchases({
        'parameters': {env: "prod"},
        'success': onSkuDetails,
        'failure': onSkuDetailsFailed
    });
}*/

/*function onSkuDetails(response) {
    console.log("onSkuDetails", response);

    let products = response.response.details;
    let count = products.length;
    isSubscribed = false;
    for (let i = 0; i < count; i++) {
        let product = products[i];
        console.log(product.itemId);
        console.log(product.state);
        if(product.state === "ACTIVE" && product.itemId === "dcikkhacpoppgnmbnnebdiafoeccbdoc") {
            isSubscribed = true;
        }
    }
    if(!isSubscribed) {
        alert('Пожалуйста, приобретите подписку и перезагрузите страницу для продолжения работы с плагином. ' +
            'Ссылка для приобретения подписки https://chrome.google.com/webstore/detail/wordstat-web-assistant/dcikkhacpoppgnmbnnebdiafoeccbdoc?authuser=2');
    }

}

function onSkuDetailsFailed(response) {
        console.log("onSkuDetailsFailed", response);
        alert('Что-то пошло не так. Обратитесь в службу поддержки плагина.');
        isSubscribed = false;
}*/


jQuery(function () {

    let config = {
        action: 'check'
    };
    transport(config, function (response) {
        if (response.result) {
            wordstatWebAssistantLoad(jQuery, window, transport);
        } else {
            alert('Пожалуйста, приобретите подписку и перезагрузите страницу для продолжения работы с плагином. ' +
                'Ссылка для приобретения подписки https://chrome.google.com/webstore/detail/wordstat-web-assistant/dcikkhacpoppgnmbnnebdiafoeccbdoc?authuser=2');
        }
    });
    wordstatWebAssistantLoad(jQuery, window, transport);

});

/*jQuery(function () {
    chrome.identity.getAuthToken({ 'interactive': false }, function(token) {
        let CWS_LICENSE_API_URL = 'https://www.googleapis.com/chromewebstore/v1.1/userlicenses/';
        xhrWithAuth('GET', CWS_LICENSE_API_URL + chrome.runtime.id, true, onLicenseFetched);
    });
    getProductList();
    setTimeout(function checkSubs() {
        if(isSubscribed === undefined) {
            setTimeout(checkSubs, 500);
        }
        else {
            console.log(isSubscribed);
            if(isSubscribed) {
                wordstatWebAssistantLoad(jQuery, window, transport);
            }
        }
    }, 500);

});*/


// no conflict
jQuery.noConflict();