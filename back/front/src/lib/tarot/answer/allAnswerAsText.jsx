import React from 'react';
export const allAnswerAsText = JSXTextTagArr => {
    if (JSXTextTagArr === undefined || JSXTextTagArr === null) return;
    if (JSXTextTagArr?.[JSXTextTagArr?.length - 1] === null) JSXTextTagArr?.pop();

    // 재귀적으로 JSX 요소의 텍스트를 추출하는 함수
    const extractTextFromJSX = (element) => {
        if (typeof element === 'string' || typeof element === 'number') {
            return String(element);
        }
        
        if (Array.isArray(element)) {
            return element.map(extractTextFromJSX).join('');
        }
        
        if (element && typeof element === 'object' && element.props && element.props.children) {
            return extractTextFromJSX(element.props.children);
        }
        
        return '';
    };

    // 안전한 join 함수 개선 (strong 태그 등 중첩 요소 처리)
    const safeJoin = (children, separator = '') => {
        if (Array.isArray(children)) {
            return children.map(extractTextFromJSX).join(separator);
        } else if (typeof children === 'string' || typeof children === 'number') {
            return String(children);
        } else if (children && typeof children === 'object' && children.props) {
            // JSX 요소인 경우 (strong, em, span 등)
            return extractTextFromJSX(children);
        }
        return '';
    };

    // 첫 번째 요소 처리 함수
    const processFirstElement = (elem) => {
        const questionTagArr = elem?.props?.children;
        if (!Array.isArray(questionTagArr)) {
            return extractTextFromJSX(elem?.props?.children);
        }

        const processQuestionTag = (questionTag) => {
            const childrenOfQuestionTag = Array.isArray(questionTag?.props?.children)
                ? safeJoin(questionTag?.props?.children)
                : questionTag?.props?.children || '';
            
            if (Array.isArray(childrenOfQuestionTag)) {
                return processQuestionChildren(childrenOfQuestionTag);
            } else if (typeof childrenOfQuestionTag === 'string') {
                return childrenOfQuestionTag + '\n';
            }
            return safeJoin(questionTag?.props?.children) + '\n';
        };

        const processQuestionChildren = (children) => {
            const filtered = children?.filter(elem => 
                elem !== null && elem !== undefined && elem !== ''
            );

            if (filtered.length === 1) {
                if (typeof filtered[0] === 'object') {
                    const grandChildren = filtered[0]?.props?.children;
                    return safeJoin(grandChildren) + '\n';
                }
                return safeJoin(filtered) + '\n';
            }

            const elem = filtered[1];
            if (typeof elem === 'object') {
                const childrenOfelem = elem?.props?.children;
                return filtered[0] + extractTextFromJSX(childrenOfelem) + '\n';
            }

            return safeJoin(filtered) + '\n';
        };

        const textContentArr = questionTagArr.map(processQuestionTag);
        return textContentArr.join('') + '\n';
    };

    // 배열 요소 처리 함수 (재귀)
    const processArrayElement = (elem) => {
        if (elem?.length > 1) {
            return elem.map(e => 
                e?.props?.children
                    ?.map(x => safeJoin(x?.props?.children))
                    ?.join('\n')
            )?.join('\n\n');
        } else if (elem?.length === 1) {
            return elem[0]?.props?.children
                ?.map(child => safeJoin(child?.props?.children))
                ?.join('\n');
        }
        return '';
    };

    // 일반 요소 처리 함수
    const processRegularElement = (elem) => {
        if (Array.isArray(elem?.props?.children)) {
            const textContent = elem.props.children
                .map(child => {
                    if (Array.isArray(child)) {
                        return processArrayElement(child);
                    }
                    return extractTextFromJSX(child?.props?.children);
                })
                .join('\n');
            return textContent + '\n';
        } else {
            const textContent = extractTextFromJSX(elem?.props?.children);
            return textContent + '\n';
        }
    };

    // 메인 처리 함수 (재귀적 구조)
    const processElement = (elem, index) => {
        if (index === 0) {
            return processFirstElement(elem);
        }
        return processRegularElement(elem);
    };

    const lines = JSXTextTagArr?.map(processElement);
    const result = lines?.join('');
    return result;
};
// export const allAnswerAsText = JSXTextTagArr => {
//     if (JSXTextTagArr === undefined || JSXTextTagArr === null) return;
//     if (JSXTextTagArr?.[JSXTextTagArr?.length - 1] === null) JSXTextTagArr?.pop();

//     // 재귀적으로 JSX 요소의 텍스트를 추출하는 함수
//     const extractTextFromJSX = (element) => {
//         if (typeof element === 'string' || typeof element === 'number') {
//             return String(element);
//         }
        
//         if (Array.isArray(element)) {
//             return element.map(extractTextFromJSX).join('');
//         }
        
//         if (element && typeof element === 'object' && element.props && element.props.children) {
//             return extractTextFromJSX(element.props.children);
//         }
        
//         return '';
//     };

//     // 안전한 join 함수 개선 (strong 태그 등 중첩 요소 처리)
//     const safeJoin = (children, separator = '') => {
//         if (Array.isArray(children)) {
//             return children.map(extractTextFromJSX).join(separator);
//         } else if (typeof children === 'string' || typeof children === 'number') {
//             return String(children);
//         } else if (children && typeof children === 'object' && children.props) {
//             // JSX 요소인 경우 (strong, em, span 등)
//             return extractTextFromJSX(children);
//         }
//         return '';
//     };

//     const lines = JSXTextTagArr?.map((elem, i) => {
//         // console.log(elem?.props?.children)
//         let textContent;
//         if (i === 0) {
//             const questionTagArr = elem?.props?.children;
//             if (Array.isArray(questionTagArr)) {
//                 const textContentArr = questionTagArr?.map((questionTag, i) => {
//                     const childrenOfQuestionTag = Array.isArray(
//                         questionTag?.props?.children
//                     )
//                         ? safeJoin(questionTag?.props?.children)
//                         : questionTag?.props?.children || '';
//                     if (Array.isArray(childrenOfQuestionTag)) {
//                         const childrenOfQuestionTagWithoutEmptyValue =
//                             childrenOfQuestionTag??.filter(elem => {
//                                 if (elem !== null && elem !== undefined && elem !== '') {
//                                     return elem;
//                                 }
//                             });

//                         // 질문속 주체와 대상 간의 관계 쪽
//                         if (childrenOfQuestionTagWithoutEmptyValue?.length === 1) {
//                             if (
//                                 typeof childrenOfQuestionTagWithoutEmptyValue[0] === 'object'
//                             ) {
//                                 const childrenOfchildrenOfQuestionTagWithoutEmptyValue =
//                                     childrenOfQuestionTagWithoutEmptyValue[0]?.props?.children;

//                                 return (
//                                     safeJoin(childrenOfchildrenOfQuestionTagWithoutEmptyValue) +
//                                     '\n'  // ← 여기 변경
//                                 );
//                             }

//                             return safeJoin(childrenOfQuestionTagWithoutEmptyValue) + '\n';  // ← 여기 변경
//                         }

//                         const elem = childrenOfQuestionTagWithoutEmptyValue[1];
//                         if (typeof elem === 'object') {
//                             const childrenOfelem = elem?.props?.children;
//                             return (
//                                 childrenOfQuestionTagWithoutEmptyValue[0] +
//                                 extractTextFromJSX(childrenOfelem) +
//                                 '\n'  // ← 여기 변경
//                             );
//                         }

//                         return safeJoin(childrenOfQuestionTagWithoutEmptyValue) + '\n';  // ← 여기 변경
//                     } else if (typeof childrenOfQuestionTag === 'string') {
//                         // 안찍힘
//                         return childrenOfQuestionTag + '\n';  // ← 여기 변경
//                     }
//                     return safeJoin(questionTag?.props?.children) + '\n';  // ← 여기 변경
//                 });
//                 textContent = textContentArr?.join('') + '\n';  // ← 여기 변경
//                 return textContent;
//             } else {
//                 textContent = extractTextFromJSX(elem?.props?.children);
//                 return textContent;
//             }
//         }

//         if (Array.isArray(elem?.props?.children)) {
//             // console.log(" : ", elem.props.children)
//             textContent = elem?.props?.children
//                 .map((elem, i) => {
//                     if (Array.isArray(elem)) {
//                         // console.log(elem);
//                         if (elem?.length > 1) {
//                             return elem
//                                 ?.map((e, i) => {
//                                     return e?.props?.children
//                                         ?.map((x, i) => {
//                                             return safeJoin(x?.props?.children);
//                                         })
//                                         ?.join('\n');  // ← 여기 변경
//                                 })
//                                 ?.join('\n\n');  // ← 여기 변경
//                         } else if (elem?.length === 1) {
//                             return elem[0]?.props?.children
//                                 ?.map((elem, i) => {
//                                     // console.log(elem.props.children);
//                                     return safeJoin(elem?.props?.children);
//                                 })
//                                 ?.join('\n');  // ← 여기 변경
//                         }
//                     }
//                     return extractTextFromJSX(elem?.props?.children);
//                 })
//                 ?.join('\n'); // ← 여기 변경
//             // console.log(textContent);
//             return textContent + '\n';  // ← 여기 변경
//         } else {
//             textContent = extractTextFromJSX(elem?.props?.children);
//             return textContent + '\n';  // ← 여기 변경
//         }
//     });
//     const result = lines?.join('');
//     // console.log(result)
//     return result;
// };

// // export const allAnswerAsText = JSXTextTagArr => {
// //   if (JSXTextTagArr === undefined || JSXTextTagArr === null) return;
// //   if (JSXTextTagArr?.[JSXTextTagArr?.length - 1] === null) JSXTextTagArr?.pop();

// //   // 안전한 join 함수 추가
// //   const safeJoin = (children, separator = '') => {
// //     if (Array.isArray(children)) {
// //       return children.join(separator);
// //     } else if (typeof children === 'string' || typeof children === 'number') {
// //       return String(children);
// //     }
// //     return '';
// //   };

// //   const lines = JSXTextTagArr?.map((elem, i) => {
// //     // console.log(elem?.props?.children)
// //     let textContent;
// //     if (i === 0) {
// //       const questionTagArr = elem?.props?.children;
// //       if (Array.isArray(questionTagArr)) {
// //         const textContentArr = questionTagArr?.map((questionTag, i) => {
// //           const childrenOfQuestionTag = Array.isArray(
// //             questionTag?.props?.children
// //           )
// //             ? safeJoin(questionTag?.props?.children)
// //             : questionTag?.props?.children || '';
// //           if (Array.isArray(childrenOfQuestionTag)) {
// //             const childrenOfQuestionTagWithoutEmptyValue =
// //               childrenOfQuestionTag??.filter(elem => {
// //                 if (elem !== null && elem !== undefined && elem !== '') {
// //                   return elem;
// //                 }
// //               });


// //             // 질문속 주체와 대상 간의 관계 쪽
// //             if (childrenOfQuestionTagWithoutEmptyValue?.length === 1) {
// //               if (
// //                 typeof childrenOfQuestionTagWithoutEmptyValue[0] === 'object'
// //               ) {
// //                 const childrenOfchildrenOfQuestionTagWithoutEmptyValue =
// //                   childrenOfQuestionTagWithoutEmptyValue[0]?.props?.children;


// //                 return (
// //                   safeJoin(childrenOfchildrenOfQuestionTagWithoutEmptyValue) +
// //                   '\\n'
// //                 );
// //               }


// //               return safeJoin(childrenOfQuestionTagWithoutEmptyValue) + '\\n';
// //             }


// //             const elem = childrenOfQuestionTagWithoutEmptyValue[1];
// //             if (typeof elem === 'object') {
// //               const childrenOfelem = elem?.props?.children;
// //               return (
// //                 childrenOfQuestionTagWithoutEmptyValue[0] +
// //                 childrenOfelem +
// //                 '\\n'
// //               );
// //             }


// //             return safeJoin(childrenOfQuestionTagWithoutEmptyValue) + '\\n';
// //           } else if (typeof childrenOfQuestionTag === 'string') {
// //             // 안찍힘
// //             return childrenOfQuestionTag + '\\n';
// //           }
// //           return safeJoin(questionTag?.props?.children) + '\\n';
// //         });
// //         textContent = textContentArr?.join('') + '\\n';
// //         return textContent;
// //       } else {
// //         textContent = elem?.props?.children;
// //         return textContent;
// //       }
// //     }


// //     if (Array.isArray(elem?.props?.children)) {
// //       // console.log(" : ", elem.props.children)
// //       textContent = elem?.props?.children
// //         .map((elem, i) => {
// //           if (Array.isArray(elem)) {
// //             // console.log(elem);
// //             if (elem?.length > 1) {
// //               return elem
// //                 ?.map((e, i) => {
// //                   return e?.props?.children
// //                     ?.map((x, i) => {
// //                       return safeJoin(x?.props?.children);
// //                     })
// //                     ?.join('\\n');
// //                 })
// //                 ?.join('\\n\\n');
// //             } else if (elem?.length === 1) {
// //               return elem[0]?.props?.children
// //                 ?.map((elem, i) => {
// //                   // console.log(elem.props.children);
// //                   return safeJoin(elem?.props?.children);
// //                 })
// //                 ?.join('\\n');
// //             }
// //           }
// //           return elem?.props?.children;
// //         })
// //         ?.join('\\n'); // 또는 다른 적절한 속성 사용
// //       // console.log(textContent);
// //       return textContent + '\\n';
// //     } else {
// //       textContent = elem?.props?.children; // 또는 다른 적절한 속성 사용
// //       return textContent + '\\n';
// //     }
// //   });
// //   const result = lines?.join('');
// //   // console.log(result)
// //   return result;
// // };

