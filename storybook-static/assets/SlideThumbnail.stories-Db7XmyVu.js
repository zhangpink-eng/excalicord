import{a as e,n as t}from"./chunk-BneVvdWh.js";import{o as n,t as r}from"./iframe-BF3bG1CA.js";function i({slide:e,index:t,isSelected:n,onClick:r,onDelete:i,onRename:s,canDelete:c=!0}){let[l,u]=(0,a.useState)(!1),[d,f]=(0,a.useState)(e.name),p=(0,a.useRef)(null);(0,a.useEffect)(()=>{l&&p.current&&(p.current.focus(),p.current.select())},[l]);let m=()=>{s&&(f(e.name),u(!0))},h=()=>{d.trim()&&s&&s(d.trim()),u(!1)};return(0,o.jsxs)(`div`,{className:`relative group flex flex-col items-center gap-1 ${n?`scale-105`:``} transition-all duration-200`,children:[(0,o.jsxs)(`div`,{onClick:r,onDoubleClick:m,className:`
          relative w-16 h-12 rounded border-2 cursor-pointer overflow-hidden
          transition-all duration-200
          ${n?`border-primary shadow-lg ring-2 ring-primary/20`:`border-border hover:border-primary/50`}
        `,children:[(0,o.jsx)(`div`,{className:`absolute inset-0 bg-muted flex items-center justify-center`,children:(0,o.jsx)(`span`,{className:`text-xs text-muted-foreground font-medium`,children:t+1})}),(0,o.jsx)(`div`,{className:`absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity`})]}),l?(0,o.jsx)(`input`,{ref:p,type:`text`,value:d,onChange:e=>f(e.target.value),onBlur:h,onKeyDown:t=>{t.key===`Enter`?h():t.key===`Escape`&&(u(!1),f(e.name))},className:`w-16 h-5 text-[10px] text-center bg-background border border-primary rounded px-1 outline-none`}):(0,o.jsx)(`span`,{onDoubleClick:m,className:`text-[10px] truncate max-w-16 ${n?`text-primary font-medium`:`text-muted-foreground`}`,title:e.name,children:e.name}),c&&i&&(0,o.jsx)(`button`,{onClick:e=>{e.stopPropagation(),i()},className:`absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full text-[10px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-destructive/90 z-10`,title:`Delete slide`,children:`×`})]})}var a,o,s=t((()=>{a=e(n(),1),o=r(),i.__docgenInfo={description:``,methods:[],displayName:`SlideThumbnail`,props:{slide:{required:!0,tsType:{name:`Slide`},description:``},index:{required:!0,tsType:{name:`number`},description:``},isSelected:{required:!0,tsType:{name:`boolean`},description:``},onClick:{required:!0,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:``},onDelete:{required:!1,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:``},onRename:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(name: string) => void`,signature:{arguments:[{type:{name:`string`},name:`name`}],return:{name:`void`}}},description:``},canDelete:{required:!1,tsType:{name:`boolean`},description:``,defaultValue:{value:`true`,computed:!1}}}}})),c,l,u,d,f,p,m,h;t((()=>{s(),c=r(),l={title:`Slides/SlideThumbnail`,component:i,tags:[`autodocs`],argTypes:{isSelected:{control:`boolean`},canDelete:{control:`boolean`}}},u={args:{slide:{id:`1`,name:`Slide 1`},index:0,isSelected:!1,canDelete:!0,onClick:()=>console.log(`clicked`),onDelete:()=>console.log(`deleted`)}},d={args:{slide:{id:`1`,name:`Slide 1`},index:0,isSelected:!0,canDelete:!0,onClick:()=>console.log(`clicked`),onDelete:()=>console.log(`deleted`)}},f={args:{slide:{id:`1`,name:`Slide 1`},index:0,isSelected:!1,canDelete:!0,onClick:()=>console.log(`clicked`),onDelete:()=>console.log(`deleted`),onRename:e=>console.log(`renamed to`,e)}},p={args:{slide:{id:`1`,name:`Slide 1`},index:0,isSelected:!1,canDelete:!1,onClick:()=>console.log(`clicked`)}},m={render:()=>(0,c.jsxs)(`div`,{className:`flex gap-2 p-4`,children:[(0,c.jsx)(i,{slide:{id:`1`,name:`Slide 1`},index:0,isSelected:!0,canDelete:!0,onClick:()=>console.log(`clicked 1`),onDelete:()=>console.log(`deleted 1`)}),(0,c.jsx)(i,{slide:{id:`2`,name:`Slide 2`},index:1,isSelected:!1,canDelete:!0,onClick:()=>console.log(`clicked 2`),onDelete:()=>console.log(`deleted 2`)}),(0,c.jsx)(i,{slide:{id:`3`,name:`Slide 3`},index:2,isSelected:!1,canDelete:!0,onClick:()=>console.log(`clicked 3`),onDelete:()=>console.log(`deleted 3`)})]})},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    slide: {
      id: "1",
      name: "Slide 1"
    },
    index: 0,
    isSelected: false,
    canDelete: true,
    onClick: () => console.log("clicked"),
    onDelete: () => console.log("deleted")
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    slide: {
      id: "1",
      name: "Slide 1"
    },
    index: 0,
    isSelected: true,
    canDelete: true,
    onClick: () => console.log("clicked"),
    onDelete: () => console.log("deleted")
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    slide: {
      id: "1",
      name: "Slide 1"
    },
    index: 0,
    isSelected: false,
    canDelete: true,
    onClick: () => console.log("clicked"),
    onDelete: () => console.log("deleted"),
    onRename: (name: string) => console.log("renamed to", name)
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    slide: {
      id: "1",
      name: "Slide 1"
    },
    index: 0,
    isSelected: false,
    canDelete: false,
    onClick: () => console.log("clicked")
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex gap-2 p-4">
      <SlideThumbnail slide={{
      id: "1",
      name: "Slide 1"
    }} index={0} isSelected={true} canDelete={true} onClick={() => console.log("clicked 1")} onDelete={() => console.log("deleted 1")} />
      <SlideThumbnail slide={{
      id: "2",
      name: "Slide 2"
    }} index={1} isSelected={false} canDelete={true} onClick={() => console.log("clicked 2")} onDelete={() => console.log("deleted 2")} />
      <SlideThumbnail slide={{
      id: "3",
      name: "Slide 3"
    }} index={2} isSelected={false} canDelete={true} onClick={() => console.log("clicked 3")} onDelete={() => console.log("deleted 3")} />
    </div>
}`,...m.parameters?.docs?.source}}},h=[`Default`,`Selected`,`WithRename`,`CannotDelete`,`MultipleSlides`]}))();export{p as CannotDelete,u as Default,m as MultipleSlides,d as Selected,f as WithRename,h as __namedExportsOrder,l as default};