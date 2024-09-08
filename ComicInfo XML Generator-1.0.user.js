// ==UserScript==
// @name         ComicInfo XML Generator
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Generate comicinfo.xml from gallery page
// @match        https://hentainexus.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Function to create and download the XML file
    function downloadXML(xmlContent) {
        const blob = new Blob([xmlContent], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'comicinfo.xml';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Function to parse the HTML and generate the XML content
    function generateXML() {
        const title = document.querySelector('.column .title').innerText;

        function getTextAfterLabel(label) {
            const td = Array.from(document.querySelectorAll('td.viewcolumn')).find(td => td.innerText.includes(label));
            if (td) {
                const text = td.nextElementSibling.querySelector('a').innerText;
                return text.replace(/\s*\(\d+\)$/, ''); // Remove bracketed number
            }
            return '';
        }

        const artist = getTextAfterLabel('Artist');
        const publisher = getTextAfterLabel('Publisher');
        const magazine = getTextAfterLabel('Magazine');

        const tagsTd = Array.from(document.querySelectorAll('td.viewcolumn')).find(td => td.innerText.includes('Tags'));
        const tags = tagsTd ? Array.from(tagsTd.nextElementSibling.querySelectorAll('.tag a')).map(a => a.innerText.replace(/\s*\(\d+\)$/, '')).join(', ') : '';

        const summaryTd = Array.from(document.querySelectorAll('td.viewcolumn')).find(td => td.innerText.includes('Description'));
        const summary = summaryTd ? summaryTd.nextElementSibling.innerText : '';

        const currentUrl = window.location.href;

        const xmlContent = `<?xml version='1.0' encoding='utf-8'?>\r\n<ComicInfo>\r\n    <Title>${title}</Title>\r\n    <Tags>${magazine ? magazine + ', ' : ''}${tags}</Tags>\r\n    <Writer>${artist || 'Unknown'}</Writer>\r\n    <Summary>${summary}</Summary>\r\n    <Publisher>${publisher || 'Unknown'}</Publisher>\r\n    <Web>${currentUrl}</Web>\r\n</ComicInfo>`;

        downloadXML(xmlContent);
    }

    // Add the button to the page
    const referenceElement = Array.from(document.querySelectorAll('.level-item a')).find(a => /https:\/\/hentainexus\.com\/zip\/\d+/.test(a.href));
    if (referenceElement) {
        const newDiv = document.createElement('div');
        newDiv.className = 'level-item';

        const button = document.createElement('a');
        button.className = 'button is-primary';
        button.style.marginRight = '1em';
        button.innerHTML = `
            <span class="icon">
                <svg class="svg-inline--fa fa-file-zipper" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="file-zipper" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" data-fa-i2svg="">
                    <path fill="currentColor" d="M256 0v128h128L256 0zM224 128L224 0H48C21.49 0 0 21.49 0 48v416C0 490.5 21.49 512 48 512h288c26.51 0 48-21.49 48-48V160h-127.1C238.3 160 224 145.7 224 128zM96 32h64v32H96V32zM96 96h64v32H96V96zM96 160h64v32H96V160zM128.3 415.1c-40.56 0-70.76-36.45-62.83-75.45L96 224h64l30.94 116.9C198.7 379.7 168.5 415.1 128.3 415.1zM144 336h-32C103.2 336 96 343.2 96 352s7.164 16 16 16h32C152.8 368 160 360.8 160 352S152.8 336 144 336z"></path>
                </svg>
            </span>
            <span class="button-label">Generate XML</span>`;
        button.addEventListener('click', generateXML);

        newDiv.appendChild(button);
        referenceElement.parentNode.parentNode.insertBefore(newDiv, referenceElement.parentNode.nextSibling);
    }
})();