var kimchi = {
  pickle: function(fromText) {
    // Internal search function, avoids issues with non existent Array.indexOf() functionality in certain versions
    var inArr = function(a, s) {
        for (var x = -1, y = 0; y < a.length; y++)
          if (a[y] == s) {
            x = y;
            break
          }
        return x;
      },
    // Korean...
    // This is a bit of a tricky one, as it involves learning where the syllable blocks start and end...
    //
    // Here's the trick, separate it into individual words, and then determine blocks by working in reverse. 
    // Reverse engineering the Korean transliteration allows you to apply the following algorithm rules:
    //
    // 1) All Korean words end in a tail or vowel, and thus all Korean syllable blocks
    // will end in a tail or vowel.
    // 2) All dashes get converted to mute signifiers (~).
    // 3) All initial vowels get preceded by a mute signifier.
    // 4) Start from the end and work from right to left.
    // 5) Determine the letter block, (Note, for the final letter block, this is easy as vowels and tails 
    // are unique (No union set)
    // 6) If the letter block determined is:
    // 6a) a tail, then the next back-block will be a vowel (No exceptions)
    // 6b) a vowel, then the next back-block will be a lead. If it pulls up a vowel, this means a mute lead
    // is the back-block, followed by the back-block vowel that was found.
    // 6c) a lead, then the next back-block will be a tail or a vowel of the "next" syllable block. (I say
    // "next" as we are working in reverse... the "next" is actually the previous letter-block. If the lead
    // is a mute signifier (~), treat it as such.
    // 6d) a mute signifier found immediately "after" a lead consonant only means a forced separation of 
    // letters. If encountered, stop the extraction of the lead and expect a new tail/vowel.
    // 7) If there are still more letter blocks, continue from step 3, until none are left.
    //
    // Once done, separate each syllable block into lead, vowel and tail (where applicable)
    // and then apply special formula to calculate exact Hangeul Jamo character block.
    // Character code point is calculated by substituting the indices for lead (L), vowel (V) 
    // and tail (T) where applicable. Setting tail index (T) as 0 for lead/vowel only combinations.
    // The formula is:
    //
    // Code Point = T + 28(V - 1) + 588(L - 1) + 44032
    //
    // Note: To force certain syllables into place, the use of a dash 
    // (-) is permitted. For example "Ingan-eun" would be parsed as
    // (@/I/N)(G/A/N)(@/EU/N) as opposed to (@/I/NG)(@/A/N)(@/EU/N) where
    // @ represents the mute consonant.
    
    aLead = new Array("g","kk","n","d","tt","r","m","b","pp","s","ss","-","j","jj","ch","k","t","p","h");
    aVowel = new Array("a","ae","ya","yae","eo","e","yeo","ye","o","wa","wae","oe","yo","u","wo","we","wi","yu","eu","ui","i");
    aTail = new Array("g","gg","gs","n","nj","nh","d","l","lg","lm","lb","ls","lt","lp","lh","m","b","bs","s","ss","ng","j","c","k","t","p","h");
    
    // Change all letters to lower-case.
    fromText = fromText.toLowerCase();
    toText = "";
    
    // Split into Alpha/Dash and non-Alpha/Dash arrays
    // Then it's simply a matter of flipping between the two arrays and displaying accordingly.
    regexp1 = /[^a-z\-]+/;
    regexp2 = /[a-z\-]+/;
    aKorean = new Array();
    aKorean = fromText.split(regexp1);
    aNotKorean = new Array();
    aNotKorean = fromText.split(regexp2);
  
    iType = 3;
    iPhase = 0;
    // Assume iType is 3 - Tail, as opposed to 2 - Vowel, or 1 - Lead

    // Loop through each Korean word.
    for (var iLoop = 0; iLoop < aKorean.length; iLoop++)
    {
      sWord = aKorean[iLoop];

      // Determine if first letter is vowel, if so latch a dash on its front.
      var sLetterNo1 = sWord.substr(0,1);
      switch (true)
      {
        case(sLetterNo1 == "a" || sLetterNo1 == "e" || sLetterNo1 == "i" || sLetterNo1 == "o" || sLetterNo1 == "u" || sLetterNo1 == "w" || sLetterNo1 == "y"):
          sWord = "-" + sWord;
          break;
      }
      
      // Loop through in reverse and extract letter blocks.
      var sLetterExt = "";
      var bFoundLetter = false;
      var sLetterBlock = ""
      for (var iLoop2 = sWord.length - 1; iLoop2 > -1; iLoop2--)
      {
        var iLocationLast = iLoop2;
        var iLen = 1
        while (!bFoundLetter)
        {
          var sExtract = sWord.substr(iLocationLast-iLen+1, iLen);
          switch (iType)
          {
            case 1:
              var aChosen = aLead;
              break;
            case 2:
              var aChosen = aVowel;
              break;
            case 3:
              var aChosen = aTail;
              break;
          }
          
          // Attempt to find letter in chosen array
          // This is important, as there is no chance that a letter will be missed... 
          /// At least I hope not...
          var iLocation = inArr(aChosen, sExtract);
          if ((iLocation < 0) && (sLetterExt == ""))
          {
            // If the letter isn't found, move to next logical array,
            // move cursor back and break out of current loop for restart.
            iType = ((iType - 1) < 1)?3:(iType - 1);
            iLoop2++;
            break;
          }
          if ((iLocation < 0) && (sLetterExt == "-") && (iPhase == 1))
          {
            // If the letter found is a dash (-) and the previous letter found is a lead,
            // ignore it as this is plainly a divisionary dash and not a mute.
            // Move to tail array, move cursor forward and break out of 
            // current loop for restart.
            iType = 3;
            break;
          }
          else if ((iLocation < 0) && (sLetterExt != "") && (iLocationLast == 0) && (iLen == 1) && (iType == 1))
           // It's gone as far as it can, and it can't go any further...
           // Flag letter found and assign letter type, then relocate cursor.
          {
            bLetterFound = true;
            var sLetterBlockDiv = (iType > 1)?"/":"";
            var sLetterBlockSep = (iType == 1)?" ":"";
            sLetterBlock = sLetterBlockSep + sLetterBlockDiv + sLetterExt + sLetterBlock;
            iLoop2 = iLocationLast - iLen + 1;
            sLetterExt = "";
            break;
          }
          else if ((iLocation < 0) && (sLetterExt != ""))
           // It's gone as far as it can, and it can't go any further...
           // Flag letter found and assign letter type, then relocate cursor.
          {
            bLetterFound = true;
            if ((iType == iPhase) && (sLetterBlock != ""))
            {
              // This will only happen for Vowel to Vowel transitions...
              // And thus require a mute in front before any further processing.
              sLetterBlock = " -" + sLetterBlock;
            }
            var sLetterBlockDiv = (iType > 1)?"/":"";
            var sLetterBlockSep = (iType == 1)?" ":"";
            sLetterBlock = sLetterBlockSep + sLetterBlockDiv + sLetterExt + sLetterBlock;
            iLoop2 = iLocationLast - iLen + 1;
            sLetterExt = "";
            iPhase = iType;
          }
          else
          {
            // Letter found, but still not enough to go on, could be isolated letter,
            // or part of larger syllable block...
            
            sLetterExt = sExtract;
            if (iLocationLast == 0)
            {
              bLetterFound = true;
              sLetterBlock = sExtract + sLetterBlock;
              iType = 3;
              break;              
            }
            else
            {
              iLen++;
            }
          }
        }
      }
      var sKoreanConv = "";
      var aConvKorean = sLetterBlock.split(" ");
      for (var iSyll = 0; iSyll < aConvKorean.length; iSyll++)
      {
        if (aConvKorean[iSyll] != "")
        {
          aSyllable = aConvKorean[iSyll].split("/");
          var iLead = inArr(aLead, aSyllable[0]) + 1;
          var iVowel = inArr(aVowel, aSyllable[1]) + 1;
          // Syllables are either LV or LVT format...
          // If there is no Tail letter, set to Zero
          if (aSyllable.length == 2)
          {
            var iTail = 0;
          }
          else
          {
            var iTail = inArr(aTail, aSyllable[2]) + 1;
          }
          
          iCodePoint = iTail + (28 * (iVowel - 1)) + (588 * (iLead - 1) ) + 44032;
          sKoreanConv += "&#" + iCodePoint.toString() + ";";
        }
      }
      aKorean[iLoop] = sKoreanConv;
      sKoreanConv = "";
    }
    if (aNotKorean)
    {
      var bNotKoreanStart = (fromText.indexOf(aNotKorean[0]) == 0)?true:false;
    }
    else
    {
      var bNotKoreanStart = false;
    }
    
    iCounter = 0;
    
    switch (true)
    {
      case ((bNotKoreanStart) && (aNotKorean.length == aKorean.length)):
        // NKNK format
        for (var iDisp = 0; iDisp < aNotKorean.length; iDisp++)
        {
          toText += aNotKorean[iDisp] + aKorean[iDisp];
        }
        break;
      case ((!bNotKoreanStart) && (aNotKorean.length == aKorean.length)):
        // KNKN format
        for (var iDisp = 0; iDisp < aNotKorean.length; iDisp++)
        {
          toText += aKorean[iDisp] + aNotKorean[iDisp];
        }
        break;
      case (bNotKoreanStart):
        // NKN format
        toText += aNotKorean[0];
        if (aNotKorean.length > 1)
        {
          for (var iDisp = 0; iDisp < aKorean.length; iDisp++)
          {
            toText += aKorean[iDisp] + aNotKorean[iDisp+1];
          }
        }
        break;
      case (!bNotKoreanStart):
        // KNK format
        toText += aKorean[0];
        if (aKorean.length > 1)
        {
          for (var iDisp = 0; iDisp < aNotKorean.length; iDisp++)
          {
            toText += aNotKorean[iDisp] + aKorean[iDisp+1];
          }
        }
        break;
    }

    return toText;
  },
  ferment: function() {
    var z = document.getElementsByTagName('kimchi');
    for (x = z.length; x--;) {
      z[x].innerHTML = kimchi.pickle(z[x].childNodes[0].data);
    }
  }
}