const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'components', 'Conditionals.tsx');
let code = fs.readFileSync(targetPath, 'utf8');

// 1. Locate the modal section
const startComment = '{/* Modal View / Action Style Sales */}';
const targetStart = code.indexOf(startComment);

const targetEndString = `            </div>
          </div>
        </div>
      )
      }
    </div >
  );
};`;

const targetEnd = code.lastIndexOf(targetEndString);

if (targetStart === -1 || targetEnd === -1) {
  console.log("Error finding start or end of modal block");
  process.exit(1);
}

// 2. Extract inner body of the modal
let modalSegment = code.substring(targetStart, targetEnd);

const bodyStartToken = '<div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">';
const bodyStartIdx = modalSegment.indexOf(bodyStartToken);
if (bodyStartIdx === -1) {
   console.log("Could not find modal body start");
   process.exit(1);
}

// The inner body ends exactly before `</div>\n          </div>\n        </div>\n      )\n      }`
// Let's just find the last `            </div>` in modalSegment
const innerBody = modalSegment.substring(bodyStartIdx);

const earlyReturnBlock = `
  if (showViewModal && selectedCond) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => setShowViewModal(false)} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 transition-colors shadow-sm">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-4">
            <div className={\`w-12 h-12 \${isEditMode ? 'bg-amber-500' : 'bg-[#0158ad]'} rounded-xl flex items-center justify-center text-white shadow-lg transition-all\`}>
              {isEditMode ? <Pencil size={24} /> : <ClipboardCheck size={24} />}
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-800 leading-tight uppercase tracking-tight">
                {isEditMode ? 'Editar Condicional' : \`Condicional #\${selectedCond.id.split('-')[0].toUpperCase()}\`}
              </h3>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Lançado em {new Date(selectedCond.createdAt).toLocaleString('pt-BR')}</p>
            </div>
          </div>
        </div>

        <div className="bg-white w-full rounded-[40px] border border-slate-200 shadow-xl overflow-hidden flex flex-col mb-10">
          ${innerBody}
        </div>
      </div>
    );
  }
`;

// Remove the modal from the end of the file. Note that we must preserve `</div >\n  );\n};`
const currentEnd = code.substring(targetEnd);
const cleanedEndCode = code.substring(0, targetStart) + `    </div >
  );
};
`; 

// Wait, the file has the following AFTER targetEndString:
// // Simple icon wrapper for compatibility
// const ShoppingBagIcon = ({ size, className }: any) => <ShoppingCart size={size} className={className} />;
// 
// export default Conditionals;

const afterModal = code.substring(targetEnd + targetEndString.length);

const correctEndCode = code.substring(0, targetStart) + `    </div >
  );
};` + afterModal;


// 4. Inject the earlyReturnBlock
const insertPointToken = '  return (\n    <div className="space-y-8 animate-in fade-in duration-500">';
const insertIdx = correctEndCode.indexOf(insertPointToken);

if (insertIdx === -1) {
    console.log("Could not find insert point.");
    process.exit(1);
}

const finalCode = correctEndCode.substring(0, insertIdx) + earlyReturnBlock + '\n' + correctEndCode.substring(insertIdx);

fs.writeFileSync(targetPath, finalCode, 'utf8');
console.log("Successfully refactored modal to inline view.");
